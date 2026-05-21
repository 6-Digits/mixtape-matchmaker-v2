import jasonProfile from '../assets/jason_profile.jpg';
import { matches, messages, playlists } from '../data/demo';
import type { ChatMessage, Match, Playlist } from '../data/demo';
import type { AppUser } from '../state/appDataTypes';

export type MockDb = {
  user: AppUser & { provider: 'mock' };
  playlists: Playlist[];
  matches: Match[];
  messages: ChatMessage[];
  updatedAt: string;
};

const MOCK_DB_KEY = 'mixtape-matchmaker.mock-db.v5';
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
      image: jasonProfile,
      bio: 'I build playlists like little time capsules: city-pop sparkle, indie hooks, and songs for walking home late.',
      location: 'Los Angeles',
      lookingFor: 'People who trade songs with context and care about the order.',
      favoriteTrack: 'Midnight City',
      favoritePlaylist: 'City Lights, Side A',
      taste: 'M83, Robyn, Frank Ocean, Tame Impala',
      profileTags: ['Night walks', 'Synth-pop', 'Soft R&B'],
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
  const matchesById = new Map(db.matches.map((match) => [match.id, match]));
  const mergedMatches = [
    ...db.matches,
    ...seed.matches.filter((match) => !matchesById.has(match.id)),
  ];

  return compactMockDb({
    user: {
      ...seed.user,
      ...(db.user || {}),
      provider: 'mock',
      image: db.user?.image || seed.user.image,
      profileTags: Array.isArray(db.user?.profileTags) ? db.user.profileTags.slice(0, 5) : seed.user.profileTags,
    },
    playlists: db.playlists.map((playlist) => {
      const seeded = seedPlaylistsById.get(playlist.id);
      return {
        ...playlist,
        image: playlist.image || seeded?.image || seed.playlists[0].image,
        songs: Array.isArray(playlist.songs) && playlist.songs.length > 0 ? playlist.songs : seeded?.songs || [],
        comments: Array.isArray(playlist.comments) ? playlist.comments : seeded?.comments || [],
      };
    }),
    matches: mergedMatches.map((match) => {
      const seeded = seed.matches.find((item) => item.id === match.id);
      // Migrate legacy `status` if the new flags are missing.
      const legacyLiked = match.status === 'liked';
      const legacyPassed = match.status === 'passed';
      return {
        ...match,
        image: match.image || seeded?.image || seed.matches[0].image,
        bio: match.bio ?? seeded?.bio,
        location: match.location ?? seeded?.location,
        lookingFor: match.lookingFor ?? seeded?.lookingFor,
        favoriteTrack: match.favoriteTrack ?? seeded?.favoriteTrack,
        profileTags: match.profileTags ?? seeded?.profileTags,
        theyLikedYou: match.theyLikedYou ?? seeded?.theyLikedYou ?? legacyLiked,
        youLiked: match.youLiked ?? seeded?.youLiked ?? legacyLiked,
        passed: match.passed ?? seeded?.passed ?? legacyPassed,
        status: undefined,
      };
    }),
    messages: db.messages.map((message, index) => ({
      id: message.id || `m-migrated-${index}`,
      matchId: message.matchId || (message.from === 'Farhan' ? 'farhan' : message.from === 'Darren' ? 'darren' : 'jason'),
      from: message.from,
      body: message.body,
      time: message.time,
      reaction: message.reaction,
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
