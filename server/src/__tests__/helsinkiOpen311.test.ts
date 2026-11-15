import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  guessCategory,
  mapStatus,
  mapRequest,
  fetchHelsinkiIssues,
} from '../services/helsinkiOpen311';

function sample(overrides = {}) {
  return {
    service_request_id: '3585991',
    status: 'READY',
    description: 'Kadulla on lasimurskaa ainakin kävelytien leveydeltä.',
    address: 'Eteläinen Rautatiekatu',
    requested_datetime: '2026-10-23T09:29:04Z',
    lat: '60.16916',
    long: '24.92604',
    ...overrides,
  };
}

describe('mapStatus', () => {
  it('maps Helsinki statuses to ours', () => {
    expect(mapStatus('READY')).toBe('resolved');
    expect(mapStatus('processing')).toBe('in_progress');
    expect(mapStatus('RECEIVED')).toBe('reported');
  });
});

describe('guessCategory', () => {
  it('recognises Finnish keywords and falls back to other', () => {
    expect(guessCategory('Tiessä on iso kuoppa')).toBe('pothole');
    expect(guessCategory('Katuvalo ei pala')).toBe('streetlight');
    expect(guessCategory('Seinässä on graffiti')).toBe('graffiti');
    expect(guessCategory('Kadulla on lasimurskaa')).toBe('waste');
    expect(guessCategory('Liikennemerkki kääntynyt väärinpäin.')).toBe('other');
  });
});

describe('mapRequest', () => {
  it('converts a Helsinki item to our format', () => {
    const issue = mapRequest(sample());
    expect(issue).toEqual({
      id: 'helsinki-3585991',
      source: 'helsinki',
      title: 'Eteläinen Rautatiekatu',
      description: 'Kadulla on lasimurskaa ainakin kävelytien leveydeltä.',
      category: 'waste',
      status: 'resolved',
      municipality: 'Helsinki',
      location: { lat: 60.16916, lng: 24.92604 },
      createdAt: '2026-10-23T09:29:04Z',
    });
  });

  it('shortens long descriptions to 200 characters plus an ellipsis', () => {
    const issue = mapRequest(sample({ description: 'a'.repeat(500) }));
    expect(issue?.description).toHaveLength(201);
    expect(issue?.description.endsWith('…')).toBe(true);
  });

  it('returns null when the coordinates are missing or invalid', () => {
    expect(mapRequest(sample({ lat: null }))).toBeNull();
    expect(mapRequest(sample({ long: 'abc' }))).toBeNull();
  });

  it('uses a fallback title when the address is empty', () => {
    expect(mapRequest(sample({ address: '' }))?.title).toBe('Official report');
  });
});

describe('fetchHelsinkiIssues', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns converted issues and skips unusable items', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [sample(), sample({ service_request_id: '2', lat: null })],
    });
    vi.stubGlobal('fetch', fetchMock);

    const issues = await fetchHelsinkiIssues(60.17, 24.94, 1);
    expect(issues).toHaveLength(1);
    expect(issues[0].id).toBe('helsinki-3585991');
  });

  it('sends the location and radius to the API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);

    await fetchHelsinkiIssues(60.17, 24.94, 2);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('lat=60.17');
    expect(url).toContain('long=24.94');
    expect(url).toContain('radius=2');
  });

  it('throws when the API answers with an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(fetchHelsinkiIssues(60.17, 24.94, 1)).rejects.toThrow('503');
  });
});
