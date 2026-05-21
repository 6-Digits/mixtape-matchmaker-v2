import type { Match, Playlist } from '../data/demo';

const NAMES = [
  'Riley', 'Cam', 'Iris', 'Theo', 'June', 'Mika', 'Quinn', 'Devon',
  'Ezra', 'Noor', 'Sasha', 'Wren', 'Kai', 'Luca', 'Priya', 'Owen',
];

const PALETTES = [
  ['#ec407a', '#1f8a8a'],
  ['#7c3aed', '#ec4899'],
  ['#0f766e', '#22c55e'],
  ['#2563eb', '#f97316'],
  ['#be123c', '#f59e0b'],
  ['#0ea5e9', '#a855f7'],
  ['#16a34a', '#0ea5e9'],
];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function svgAvatar(name: string, bg: string, accent: string) {
  const initials = name.slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><rect width="320" height="320" rx="42" fill="url(#g)"/><circle cx="236" cy="78" r="56" fill="rgba(255,255,255,0.18)"/><circle cx="78" cy="244" r="72" fill="rgba(0,0,0,0.12)"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Inter, Arial, sans-serif" font-size="104" font-weight="800" fill="white">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateRandomMatch(existing: Match[], playlists: Playlist[]): Match | null {
  const usedNames = new Set(existing.map((m) => m.name));
  const candidates = NAMES.filter((n) => !usedNames.has(n));
  if (candidates.length === 0) return null;

  const name = pick(candidates);
  const [bg, accent] = pick(PALETTES);
  const playlist = pick(playlists) ?? null;
  const artistsFromPlaylist = playlist
    ? Array.from(new Set(playlist.songs.map((s) => s.artist))).slice(0, 3).join(', ')
    : 'M83, Phoenix, Robyn';

  return {
    id: `rand-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    image: svgAvatar(name, bg, accent),
    score: 70 + Math.floor(Math.random() * 25),
    taste: artistsFromPlaylist,
    playlist: playlist?.title ?? 'City Lights, Side A',
    bio: `${name} is here for strong openers, honest skips, and playlists that say more than a bio can.`,
    location: pick(['Los Angeles', 'Long Beach', 'Pasadena', 'Koreatown', 'Culver City', 'Oakland']),
    lookingFor: pick([
      'Someone who trades playlists instead of small talk.',
      'A good first-song recommendation.',
      'Low-pressure chats and high-quality hooks.',
    ]),
    favoriteTrack: playlist?.songs[0]?.title,
    profileTags: artistsFromPlaylist.split(', ').slice(0, 3),
    status: 'new',
  };
}
