import type { ReachableEvent } from '../types/event';

const API_BASE = 'http://localhost:3001';

export async function fetchEvents(
  location: string,
  startDate: string,
  endDate: string,
): Promise<ReachableEvent[]> {
  const params = new URLSearchParams({
    location,
    startDate: `${startDate}T00:00:00Z`,
    endDate: `${endDate}T23:59:00Z`,
  });

  const res = await fetch(`${API_BASE}/events?${params}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }

  return res.json();
}
