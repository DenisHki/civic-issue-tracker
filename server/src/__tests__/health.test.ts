import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

describe('GET /api/health', () => {
  it('returns 200 with an ok status', async () => {
    const app = createApp();
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
  });
});

describe('GET /unknown-route', () => {
  it('returns 404 for unmatched routes', async () => {
    const app = createApp();
    const res = await request(app).get('/unknown-route');

    expect(res.status).toBe(404);
  });
});
