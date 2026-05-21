import type { Song } from '../data/demo';

export type SongHit = Song & { previewUrl?: string; key: string };

type Provider = {
  name: 'itunes' | 'deezer' | 'musicbrainz';
  search: (query: string, signal?: AbortSignal) => Promise<SongHit[]>;
  lookup: (title: string, artist: string, signal?: AbortSignal) => Promise<SongHit | null>;
};

const COOLDOWN_MS = 90_000;
const providerCooldown: Partial<Record<Provider['name'], number>> = {};
const searchCache = new Map<string, SongHit[]>();
const previewCache = new Map<string, SongHit | null>();

function isCooled(name: Provider['name']) {
  const ts = providerCooldown[name];
  return !ts || Date.now() > ts;
}

function tripCooldown(name: Provider['name']) {
  providerCooldown[name] = Date.now() + COOLDOWN_MS;
}

function formatDuration(seconds?: number, fallback = '3:00') {
  if (!seconds || seconds <= 0) return fallback;
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------- iTunes ----------

const itunesProvider: Provider = {
  name: 'itunes',
  async search(query, signal) {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10`;
    const response = await fetch(url, { signal });
    if (response.status === 403 || response.status === 429) {
      tripCooldown('itunes');
      throw new Error(`iTunes ${response.status}`);
    }
    if (!response.ok) throw new Error(`iTunes ${response.status}`);
    const data = (await response.json()) as { results?: Array<Record<string, unknown>> };
    const results = data.results || [];
    if (results.length === 0) return [];
    return results
      .filter((r) => r.trackName && r.artistName)
      .map((r) => ({
        key: `itunes-${r.trackId ?? `${r.trackName}-${r.artistName}`}`,
        title: r.trackName as string,
        artist: r.artistName as string,
        album: (r.collectionName as string) || 'Single',
        year: r.releaseDate
          ? new Date(r.releaseDate as string).getFullYear() || new Date().getFullYear()
          : new Date().getFullYear(),
        duration: formatDuration(((r.trackTimeMillis as number) || 0) / 1000),
        previewUrl: r.previewUrl as string | undefined,
      }));
  },
  async lookup(title, artist, signal) {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(`${title} ${artist}`)}&entity=song&limit=1`;
    const response = await fetch(url, { signal });
    if (response.status === 403 || response.status === 429) {
      tripCooldown('itunes');
      throw new Error(`iTunes ${response.status}`);
    }
    if (!response.ok) throw new Error(`iTunes ${response.status}`);
    const data = (await response.json()) as { results?: Array<Record<string, unknown>> };
    const r = data.results?.[0];
    if (!r?.previewUrl) return null;
    return {
      key: `itunes-${r.trackId ?? `${title}-${artist}`}`,
      title: (r.trackName as string) || title,
      artist: (r.artistName as string) || artist,
      album: (r.collectionName as string) || 'Single',
      year: r.releaseDate
        ? new Date(r.releaseDate as string).getFullYear() || new Date().getFullYear()
        : new Date().getFullYear(),
      duration: formatDuration(((r.trackTimeMillis as number) || 0) / 1000),
      previewUrl: r.previewUrl as string,
    };
  },
};

// ---------- Deezer ----------
// Public, no key, CORS-enabled. Returns 30s mp3 previews via `preview` field.

const deezerProvider: Provider = {
  name: 'deezer',
  async search(query, signal) {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=10`;
    const response = await fetch(url, { signal });
    if (response.status === 403 || response.status === 429) {
      tripCooldown('deezer');
      throw new Error(`Deezer ${response.status}`);
    }
    if (!response.ok) throw new Error(`Deezer ${response.status}`);
    const data = (await response.json()) as {
      data?: Array<{
        id: number;
        title: string;
        duration: number;
        preview?: string;
        artist?: { name?: string };
        album?: { title?: string; release_date?: string };
      }>;
    };
    return (data.data || [])
      .filter((r) => r.title && r.artist?.name)
      .map((r) => ({
        key: `deezer-${r.id}`,
        title: r.title,
        artist: r.artist?.name || 'Unknown',
        album: r.album?.title || 'Single',
        year: r.album?.release_date
          ? Number(r.album.release_date.slice(0, 4)) || new Date().getFullYear()
          : new Date().getFullYear(),
        duration: formatDuration(r.duration),
        previewUrl: r.preview,
      }));
  },
  async lookup(title, artist, signal) {
    const q = `track:"${title}" artist:"${artist}"`;
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=1`;
    const response = await fetch(url, { signal });
    if (response.status === 403 || response.status === 429) {
      tripCooldown('deezer');
      throw new Error(`Deezer ${response.status}`);
    }
    if (!response.ok) throw new Error(`Deezer ${response.status}`);
    const data = (await response.json()) as { data?: Array<{
      id: number; title: string; duration: number; preview?: string;
      artist?: { name?: string }; album?: { title?: string; release_date?: string };
    }> };
    const r = data.data?.[0];
    if (!r?.preview) return null;
    return {
      key: `deezer-${r.id}`,
      title: r.title,
      artist: r.artist?.name || artist,
      album: r.album?.title || 'Single',
      year: r.album?.release_date
        ? Number(r.album.release_date.slice(0, 4)) || new Date().getFullYear()
        : new Date().getFullYear(),
      duration: formatDuration(r.duration),
      previewUrl: r.preview,
    };
  },
};

// ---------- MusicBrainz ----------
// Metadata-only (no preview URLs). Last-resort fallback for search results so the
// suggestions list isn't empty even when both preview providers are throttled.

const musicBrainzProvider: Provider = {
  name: 'musicbrainz',
  async search(query, signal) {
    const url = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&fmt=json&limit=8`;
    const response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (response.status === 503 || response.status === 429) {
      tripCooldown('musicbrainz');
      throw new Error(`MusicBrainz ${response.status}`);
    }
    if (!response.ok) throw new Error(`MusicBrainz ${response.status}`);
    const data = (await response.json()) as {
      recordings?: Array<{
        id: string;
        title?: string;
        length?: number;
        'first-release-date'?: string;
        'artist-credit'?: Array<{ name?: string }>;
        releases?: Array<{ title?: string }>;
      }>;
    };
    return (data.recordings || [])
      .filter((r) => r.title && r['artist-credit']?.[0]?.name)
      .map((r) => ({
        key: `mb-${r.id}`,
        title: r.title as string,
        artist: r['artist-credit']?.[0]?.name || 'Unknown',
        album: r.releases?.[0]?.title || 'Single',
        year: r['first-release-date']
          ? Number((r['first-release-date'] as string).slice(0, 4)) || new Date().getFullYear()
          : new Date().getFullYear(),
        duration: formatDuration(r.length ? r.length / 1000 : undefined),
        previewUrl: undefined,
      }));
  },
  async lookup() {
    return null;
  },
};

const PROVIDERS: Provider[] = [itunesProvider, deezerProvider, musicBrainzProvider];

// ---------- Public API ----------

export async function searchSongs(query: string, signal?: AbortSignal): Promise<SongHit[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const cacheKey = trimmed.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  let lastError: unknown;
  for (const provider of PROVIDERS) {
    if (!isCooled(provider.name)) continue;
    try {
      const hits = await provider.search(trimmed, signal);
      if (hits.length > 0) {
        searchCache.set(cacheKey, hits);
        return hits;
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') throw error;
      lastError = error;
      // already tripped cooldown if it was a rate-limit status; otherwise just move on
    }
  }

  if (lastError) {
    // All providers failed — return empty rather than throw so the UI degrades gracefully
    return [];
  }
  return [];
}

export async function lookupPreview(
  title: string,
  artist: string,
  signal?: AbortSignal,
): Promise<SongHit | null> {
  const cacheKey = `${title.toLowerCase()}|${artist.toLowerCase()}`;
  if (previewCache.has(cacheKey)) return previewCache.get(cacheKey) ?? null;

  for (const provider of PROVIDERS) {
    if (!isCooled(provider.name)) continue;
    try {
      const hit = await provider.lookup(title, artist, signal);
      if (hit?.previewUrl) {
        previewCache.set(cacheKey, hit);
        return hit;
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') throw error;
    }
  }
  previewCache.set(cacheKey, null);
  return null;
}
