import { matches, messages, playlists } from '../data/demo';
import type { ChatMessage, Match, Playlist } from '../data/demo';

export type MockDb = {
  user: {
    id: string;
    displayName: string;
    provider: 'mock';
  };
  playlists: Playlist[];
  matches: Match[];
  messages: ChatMessage[];
  updatedAt: string;
};

const MOCK_DB_KEY = 'mixtape-matchmaker.mock-db.v4';
const memoryStorage = new Map<string, string>();
const MAX_PLAYLISTS = 24;
const MAX_MESSAGES = 80;
const MAX_SONGS_PER_PLAYLIST = 20;

export function safeGetItem(key: string) {
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key) ?? memoryStorage.get(key) ?? null;
  } catch {
    try {
      return sessionStorage.getItem(key) ?? memoryStorage.get(key) ?? null;
    } catch {
      return memoryStorage.get(key) ?? null;
    }
  }
}

export function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    memoryStorage.set(key, value);
    return true;
  } catch {
    try {
      sessionStorage.setItem(key, value);
      memoryStorage.set(key, value);
      return true;
    } catch {
      memoryStorage.set(key, value);
      return false;
    }
  }
}

export function safeRemoveItem(key: string) {
  memoryStorage.delete(key);
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage may be blocked. In-memory state is already cleared.
  }
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Storage may be blocked. In-memory state is already cleared.
  }
}

export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function createSeedDb(): MockDb {
  return {
    user: {
      id: 'mock-user',
      displayName: 'Mock Listener',
      provider: 'mock',
    },
    playlists,
    matches,
    messages,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeMockDb(db: MockDb): MockDb {
  const seed = createSeedDb();
  const seedPlaylistsById = new Map(seed.playlists.map((playlist) => [playlist.id, playlist]));

  return compactMockDb({
    user: db.user || seed.user,
    playlists: db.playlists.map((playlist) => {
      const seeded = seedPlaylistsById.get(playlist.id);
      return {
        ...playlist,
        image: playlist.image || seeded?.image || seed.playlists[0].image,
        songs: Array.isArray(playlist.songs) && playlist.songs.length > 0 ? playlist.songs : seeded?.songs || [],
        comments: Array.isArray(playlist.comments) ? playlist.comments : seeded?.comments || [],
      };
    }),
    matches: db.matches.map((match) => {
      const seeded = seed.matches.find((item) => item.id === match.id);
      return {
        ...match,
        image: match.image || seeded?.image || seed.matches[0].image,
        status: match.status ?? 'liked',
      };
    }),
    messages: db.messages.map((message, index) => ({
      id: message.id || `m-migrated-${index}`,
      matchId: message.matchId || (message.from === 'Farhan' ? 'farhan' : message.from === 'Darren' ? 'darren' : 'jason'),
      from: message.from,
      body: message.body,
      time: message.time,
    })),
    updatedAt: db.updatedAt || new Date().toISOString(),
  });
}

export function compactMockDb(db: MockDb): MockDb {
  return {
    ...db,
    playlists: db.playlists.slice(0, MAX_PLAYLISTS).map((playlist) => ({
      ...playlist,
      songs: playlist.songs.slice(0, MAX_SONGS_PER_PLAYLIST),
    })),
    messages: db.messages.slice(-MAX_MESSAGES),
    matches: db.matches.slice(0, 24),
  };
}

export function loadMockDb(): MockDb {
  const raw = safeGetItem(MOCK_DB_KEY);
  if (!raw) {
    const seed = createSeedDb();
    safeSetItem(MOCK_DB_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as MockDb;
    if (!Array.isArray(parsed.playlists?.[0]?.songs)) {
      throw new Error('Outdated mock DB');
    }
    const normalized = normalizeMockDb(parsed);
    saveMockDb(normalized);
    return normalized;
  } catch {
    const seed = createSeedDb();
    safeSetItem(MOCK_DB_KEY, JSON.stringify(seed));
    return seed;
  }
}

export function saveMockDb(db: MockDb) {
  const compacted = compactMockDb({ ...db, updatedAt: new Date().toISOString() });
  const saved = safeSetItem(MOCK_DB_KEY, JSON.stringify(compacted));
  if (!saved) {
    const emergency = {
      ...compacted,
      playlists: compacted.playlists.slice(0, 8),
      messages: compacted.messages.slice(-30),
    };
    safeSetItem(MOCK_DB_KEY, JSON.stringify(emergency));
  }
}
