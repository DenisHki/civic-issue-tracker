import type { Request, Response } from 'express';
import { fetchHelsinkiIssues, type OfficialIssue } from '../services/helsinkiOpen311';

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const MAX_RADIUS_KM = 5;
const ATTRIBUTION = 'City of Helsinki (CC BY 4.0)';

const cache = new Map<string, { expires: number; issues: OfficialIssue[] }>();

function parseNumber(value: unknown): number | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function getOfficialIssues(req: Request, res: Response): Promise<void> {
  const lat = parseNumber(req.query.lat);
  const lng = parseNumber(req.query.lng);
  const radiusInput = req.query.radius === undefined ? 1 : parseNumber(req.query.radius);

  if (
    lat === null ||
    lng === null ||
    radiusInput === null ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180 ||
    radiusInput <= 0
  ) {
    res.status(400).json({ error: 'OFFICIAL_INVALID_PARAMS' });
    return;
  }

  const radius = Math.min(radiusInput, MAX_RADIUS_KM);

  const key = `${lat.toFixed(3)}:${lng.toFixed(3)}:${radius}`;
  const cached = cache.get(key);

  if (cached && cached.expires > Date.now()) {
    res.status(200).json({ issues: cached.issues, attribution: ATTRIBUTION });
    return;
  }

  try {
    const issues = await fetchHelsinkiIssues(lat, lng, radius);

    if (cache.size >= MAX_CACHE_ENTRIES) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(key, { expires: Date.now() + CACHE_TTL_MS, issues });

    res.status(200).json({ issues, attribution: ATTRIBUTION });
  } catch (err) {
    console.error('Official issues fetch failed:', err);
    res.status(502).json({ error: 'OFFICIAL_UNAVAILABLE' });
  }
}
