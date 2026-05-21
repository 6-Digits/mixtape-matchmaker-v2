import type { Song } from '../data/demo';
import { safeGetItem, safeJsonParse } from '../services/mockDb';

export const TOKEN_KEY = 'mixtape-matchmaker.server-token';
export const THEME_KEY = 'mixtape-matchmaker.theme-mode';
export const MOCK_SESSION_KEY = 'mixtape-matchmaker.mock-session';
export const NOTIFICATION_KEY = 'mixtape-matchmaker.notifications';
export const LIKES_KEY = 'mixtape-matchmaker.like-budget';

export const MAX_NOTIFICATIONS = 8;
export const NOTIFICATION_TTL_MS = 60_000;
export const LIKE_QUOTA = 10;
export const LIKE_WINDOW_MS = 24 * 60 * 60 * 1000;

export type LikeBudget = {
  used: number;
  resetAt: number;
};

export function readLikeBudget(): LikeBudget {
  const raw = safeJsonParse<LikeBudget | null>(safeGetItem(LIKES_KEY), null);
  if (!raw || typeof raw.used !== 'number' || typeof raw.resetAt !== 'number' || Date.now() > raw.resetAt) {
    return { used: 0, resetAt: Date.now() + LIKE_WINDOW_MS };
  }
  return raw;
}

export const starterSongs: Song[] = [
  { title: 'Maps', artist: 'Yeah Yeah Yeahs', album: 'Fever to Tell', year: 2003, duration: '3:39' },
  { title: 'Rebellion (Lies)', artist: 'Arcade Fire', album: 'Funeral', year: 2004, duration: '5:10' },
  { title: 'Such Great Heights', artist: 'The Postal Service', album: 'Give Up', year: 2003, duration: '4:26' },
  { title: 'Two Weeks', artist: 'Grizzly Bear', album: 'Veckatimest', year: 2009, duration: '4:03' },
];

export const mockReplies = [
  'That track fits your playlist perfectly.',
  'I forgot how good that chorus is.',
  'Adding this to my reply mix.',
  'Your sequencing is better than mine.',
  'This is exactly the kind of song I was hoping to find here.',
];
