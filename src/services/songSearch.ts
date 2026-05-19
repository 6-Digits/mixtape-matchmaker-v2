import type { Song } from '../data/demo';

export type SongHit = Song & { previewUrl?: string; key: string };

type ItunesResult = {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  releaseDate?: string;
  trackTimeMillis?: number;
  previewUrl?: string;
};

const cache = new Map<string, SongHit[]>();

function formatDuration(ms?: number) {
  if (!ms || ms <= 0) return '3:00';
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export async function searchSongs(query: string, signal?: AbortSignal): Promise<SongHit[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const key = trimmed.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&entity=song&limit=10`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Search failed: ${response.status}`);
  const data = (await response.json()) as { results?: ItunesResult[] };

  const hits: SongHit[] = (data.results || [])
    .filter((r) => r.trackName && r.artistName)
    .map((r) => ({
      key: String(r.trackId ?? `${r.trackName}-${r.artistName}`),
      title: r.trackName as string,
      artist: r.artistName as string,
      album: r.collectionName || 'Single',
      year: r.releaseDate ? new Date(r.releaseDate).getFullYear() || new Date().getFullYear() : new Date().getFullYear(),
      duration: formatDuration(r.trackTimeMillis),
      previewUrl: r.previewUrl,
    }));

  cache.set(key, hits);
  return hits;
}
