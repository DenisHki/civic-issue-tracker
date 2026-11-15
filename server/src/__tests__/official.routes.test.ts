import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

vi.mock('../services/helsinkiOpen311', () => ({
  fetchHelsinkiIssues: vi.fn(),
}));
import { fetchHelsinkiIssues } from '../services/helsinkiOpen311';

const mockFetch = vi.mocked(fetchHelsinkiIssues);
const app = createApp();

const fakeIssue = {
  id: 'helsinki-1',
  source: 'helsinki' as const,
  title: 'Mikonkatu',
  description: 'Test',
  category: 'other' as const,
  status: 'resolved' as const,
  municipality: 'Helsinki',
  location: { lat: 60.17, lng: 24.94 },
  createdAt: '2026-11-11T06:43:36Z',
};

describe('GET /api/official-issues', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns 400 for missing or non-numeric coordinates', async () => {
    const res = await request(app).get('/api/official-issues?lat=abc&lng=24.9');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('OFFICIAL_INVALID_PARAMS');
  });

  it('returns 400 for out-of-range coordinates', async () => {
    const res = await request(app).get('/api/official-issues?lat=100&lng=24.9');
    expect(res.status).toBe(400);
  });

  it('returns issues with attribution', async () => {
    mockFetch.mockResolvedValue([fakeIssue]);
    const res = await request(app).get('/api/official-issues?lat=60.101&lng=24.101');
    expect(res.status).toBe(200);
    expect(res.body.issues).toHaveLength(1);
    expect(res.body.attribution).toContain('Helsinki');
  });

  it('limits the radius to 5 km', async () => {
    mockFetch.mockResolvedValue([]);
    await request(app).get('/api/official-issues?lat=60.102&lng=24.102&radius=50');
    expect(mockFetch).toHaveBeenCalledWith(60.102, 24.102, 5);
  });

  it('serves repeated requests from the cache', async () => {
    mockFetch.mockResolvedValue([fakeIssue]);
    await request(app).get('/api/official-issues?lat=60.103&lng=24.103');
    await request(app).get('/api/official-issues?lat=60.103&lng=24.103');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('returns 502 when Helsinki fails and does not cache the failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('boom'));

    const failed = await request(app).get('/api/official-issues?lat=60.104&lng=24.104');
    expect(failed.status).toBe(502);
    expect(failed.body.error).toBe('OFFICIAL_UNAVAILABLE');

    mockFetch.mockResolvedValueOnce([fakeIssue]);
    const retry = await request(app).get('/api/official-issues?lat=60.104&lng=24.104');
    expect(retry.status).toBe(200);
  });
});
