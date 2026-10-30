const BASE_URL = 'https://palautteet.hel.fi/public-api/open311-public-service/v1/requests.json';

export type OfficialCategory = 'pothole' | 'streetlight' | 'graffiti' | 'waste' | 'other';
export type OfficialStatus = 'reported' | 'in_progress' | 'resolved';


export interface OfficialIssue {
  id: string;
  source: 'helsinki';
  title: string;
  description: string;
  category: OfficialCategory;
  status: OfficialStatus;
  municipality: string;
  location: { lat: number; lng: number };
  createdAt: string;
}

interface Open311Request {
  service_request_id: string;
  status: string;
  description: string | null;
  address: string | null;
  requested_datetime: string;
  lat: string | null;
  long: string | null;
}

export function guessCategory(text: string): OfficialCategory {
  const s = text.toLowerCase();
  if (/kuoppa|reikä|routa/.test(s)) return 'pothole';
  if (/katuvalo|valaistus|lamppu|valo ei/.test(s)) return 'streetlight';
  if (/graffiti|töhry|tägi|tagi/.test(s)) return 'graffiti';
  if (/roska|jäte|sotku|lasimurska/.test(s)) return 'waste';
  return 'other';
}

export function mapStatus(status: string): OfficialStatus {
  const s = status.toUpperCase();
  if (s === 'READY') return 'resolved';
  if (s === 'PROCESSING') return 'in_progress';
  return 'reported';
}

// Converts Helsinki item into my app format
export function mapRequest(r: Open311Request): OfficialIssue | null {
  const lat = Number(r.lat);
  const lng = Number(r.long);
  if (!r.lat || !r.long || Number.isNaN(lat) || Number.isNaN(lng)) return null;

  const description = (r.description ?? '').trim();
  const snippet = description.length > 200 ? `${description.slice(0, 200)}…` : description;

  return {
    id: `helsinki-${r.service_request_id}`,
    source: 'helsinki',
    title: r.address?.trim() || 'Official report',
    description: snippet,
    category: guessCategory(description),
    status: mapStatus(r.status),
    municipality: 'Helsinki',
    location: { lat, lng },
    createdAt: r.requested_datetime,
  };
}

export async function fetchHelsinkiIssues(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<OfficialIssue[]> {
  const url = `${BASE_URL}?lat=${lat}&long=${lng}&radius=${radiusKm}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });

  if (!res.ok) {
    throw new Error(`Helsinki Open311 responded with ${res.status}`);
  }

  const data = (await res.json()) as Open311Request[];
  return data.map(mapRequest).filter((i): i is OfficialIssue => i !== null);
}
