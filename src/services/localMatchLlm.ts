import type { ChatMessage, Match, Playlist, Song } from '../data/demo';

type ReplyInput = {
  message: string;
  match?: Match;
  playlists: Playlist[];
  history?: ChatMessage[];
  fallbackReplies: string[];
};

type SongRef = Song & { playlist: string };

const POSITIVE = ['love', 'great', 'amazing', 'perfect', 'good', 'nice', 'beautiful', 'incredible', 'banger', 'fire', 'underrated'];
const NEGATIVE = ['hate', 'bad', 'boring', 'terrible', 'overrated', 'meh', 'awful', 'skip'];
const GREETINGS = ['hi', 'hey', 'hello', 'yo', 'sup', 'what\'s up', 'whats up', 'hiya'];
const FAREWELLS = ['bye', 'gtg', 'goodnight', 'good night', 'later', 'ttyl', 'cya'];
const THANKS = ['thanks', 'thank you', 'ty', 'thx', 'appreciate'];
const RECOMMEND = ['recommend', 'suggestion', 'suggest', 'what should', 'any songs', 'any tracks', 'put me on'];
const MOOD_WORDS = {
  chill: ['chill', 'relax', 'calm', 'mellow', 'sleepy', 'quiet'],
  hype: ['hype', 'pump', 'energy', 'workout', 'dance', 'party', 'loud'],
  sad: ['sad', 'cry', 'breakup', 'lonely', 'down', 'rainy'],
  romantic: ['love', 'romantic', 'crush', 'date', 'flirt'],
};

function containsAny(haystack: string, words: string[]) {
  return words.some((w) => haystack.includes(w));
}

function hash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pick<T>(items: T[], seed: string, avoid?: string): T {
  const filtered = avoid ? items.filter((item) => String(item) !== avoid) : items;
  const pool = filtered.length > 0 ? filtered : items;
  return pool[hash(seed) % pool.length];
}

function findMentionedSong(lower: string, allSongs: SongRef[]): SongRef | undefined {
  return allSongs.find((song) => {
    const title = song.title.toLowerCase();
    const artist = song.artist.toLowerCase();
    return (title.length > 3 && lower.includes(title))
      || (artist.length > 3 && lower.includes(artist));
  });
}

function detectMood(lower: string): keyof typeof MOOD_WORDS | null {
  for (const [mood, words] of Object.entries(MOOD_WORDS) as [keyof typeof MOOD_WORDS, string[]][]) {
    if (containsAny(lower, words)) return mood;
  }
  return null;
}

function songsForMood(mood: keyof typeof MOOD_WORDS, songs: SongRef[]): SongRef[] {
  const lanes: Record<keyof typeof MOOD_WORDS, RegExp> = {
    chill: /(ocean|caesar|sza|miguel|solange|grizzly|postal)/i,
    hype: /(mgmt|phoenix|killers|daft|capital|m83|arctic|lumineers)/i,
    sad: /(florence|sky ferreira|frank|sza|grizzly|knife)/i,
    romantic: /(daniel caesar|frank|sza|miguel|temper trap|grimes)/i,
  };
  const re = lanes[mood];
  const matching = songs.filter((s) => re.test(s.artist) || re.test(s.title));
  return matching.length > 0 ? matching : songs;
}

function lastFromMatch(history: ChatMessage[] | undefined, matchName: string): string | undefined {
  if (!history || history.length === 0) return undefined;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i].from === matchName) return history[i].body;
  }
  return undefined;
}

function isQuestion(lower: string) {
  return lower.includes('?')
    || /^(what|why|how|when|where|who|which|do you|have you|are you|is it|can you|would you|should i)\b/.test(lower.trim());
}

export function createLocalMatchReply({ message, match, playlists, history, fallbackReplies }: ReplyInput) {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();
  const matchName = match?.name || 'Your match';
  const taste = match?.taste || 'your playlist';
  const matchPlaylistTitle = match?.playlist;
  const allSongs: SongRef[] = playlists.flatMap((playlist) => playlist.songs.map((song) => ({ ...song, playlist: playlist.title })));
  const matchPlaylist = playlists.find((p) => p.title === matchPlaylistTitle);
  const tasteArtists = taste.split(',').map((t) => t.trim()).filter(Boolean);
  const mentionedSong = findMentionedSong(lower, allSongs);
  const seed = `${trimmed}-${matchName}-${history?.length ?? 0}`;
  const lastReply = lastFromMatch(history, matchName);
  const songPool = matchPlaylist
    ? matchPlaylist.songs.map((s) => ({ ...s, playlist: matchPlaylist.title }))
    : allSongs;
  const tasteAnchor = tasteArtists.length > 0 ? pick(tasteArtists, seed) : 'your sound';

  const choose = (options: string[]) => pick(options, seed, lastReply);

  if (containsAny(lower, GREETINGS) && lower.length < 20) {
    return choose([
      `Hey — I was just queueing up ${matchPlaylistTitle || 'your mix'} again.`,
      `Hi. ${tasteAnchor} has been on repeat over here.`,
      `Hey. Tell me you found something new since last time.`,
    ]);
  }

  if (containsAny(lower, FAREWELLS)) {
    return choose([
      `Catch you later. I’ll send a track over before you’re back.`,
      `Talk soon — going to sit with ${matchPlaylistTitle || 'this mix'} for a bit.`,
      `Goodnight. Closing out on ${pick(songPool, seed).title}.`,
    ]);
  }

  if (containsAny(lower, THANKS)) {
    return choose([
      `Anytime. We have a real overlap on ${tasteAnchor}.`,
      `Of course — your taste makes it easy.`,
      `For sure. I’m taking notes from your playlist too.`,
    ]);
  }

  if (containsAny(lower, RECOMMEND) || /^what (should|do) (i|you)/.test(lower)) {
    const mood = detectMood(lower);
    const candidates = mood ? songsForMood(mood, songPool) : songPool;
    const rec = pick(candidates, seed);
    return choose([
      `Try “${rec.title}” by ${rec.artist}. It sits right next to ${tasteAnchor}.`,
      `If you want something close to ${tasteAnchor}, “${rec.title}” is the one.`,
      `Put on “${rec.title}” — ${rec.artist} fits ${matchPlaylistTitle || 'your mix'} cleanly.`,
    ]);
  }

  const mood = detectMood(lower);
  if (mood) {
    const rec = pick(songsForMood(mood, songPool), seed);
    const phrasing: Record<keyof typeof MOOD_WORDS, string[]> = {
      chill: [
        `Then “${rec.title}” is the move. ${rec.artist} keeps the room low.`,
        `Same — I land on “${rec.title}” whenever I want the volume to feel softer.`,
      ],
      hype: [
        `If you want it loud, “${rec.title}” still goes harder than it should.`,
        `“${rec.title}” by ${rec.artist} is the right energy here.`,
      ],
      sad: [
        `“${rec.title}” by ${rec.artist} is the one I put on for that.`,
        `Same lane — I lean on “${rec.title}” when it gets like that.`,
      ],
      romantic: [
        `“${rec.title}” by ${rec.artist} basically writes the moment for you.`,
        `Try “${rec.title}.” ${rec.artist} sells it without overdoing it.`,
      ],
    };
    return choose(phrasing[mood]);
  }

  if (mentionedSong) {
    if (containsAny(lower, NEGATIVE)) {
      return choose([
        `Fair — “${mentionedSong.title}” is divisive. I’d swap it for something from ${tasteAnchor}.`,
        `I get that. The ${mentionedSong.year} production on “${mentionedSong.title}” doesn’t land for everyone.`,
      ]);
    }
    if (containsAny(lower, POSITIVE)) {
      return choose([
        `Right? “${mentionedSong.title}” is the high point on ${mentionedSong.playlist}.`,
        `Yes. ${mentionedSong.artist} never misses, especially next to ${tasteAnchor}.`,
        `Same — “${mentionedSong.title}” is why I keep coming back to that side of the mix.`,
      ]);
    }
    return choose([
      `“${mentionedSong.title}” pairs well with ${tasteAnchor} — try it after a ${mentionedSong.artist} cut.`,
      `The ${mentionedSong.year} version of “${mentionedSong.title}” still holds up.`,
      `I’d put “${mentionedSong.title}” mid-playlist so it lands as the turn.`,
    ]);
  }

  if (containsAny(lower, ['favorite', 'best', 'top'])) {
    const fav = pick(songPool, `fav-${seed}`);
    return choose([
      `My favorite on ${matchPlaylistTitle || 'that mix'} is “${fav.title}.” ${fav.artist} pins the whole feeling down.`,
      `Top pick is “${fav.title}” — it’s the one I’d open with if I rebuilt the playlist.`,
    ]);
  }

  if (containsAny(lower, ['playlist', 'mix', 'mixtape', 'tracklist'])) {
    const fav = pick(songPool, `mix-${seed}`);
    return choose([
      `Your sequencing on ${matchPlaylistTitle || 'this one'} feels intentional. “${fav.title}” belongs in the back half.`,
      `I’d keep ${matchPlaylistTitle || 'the mix'} but move “${fav.title}” up two slots.`,
      `The mix tells a real story. ${tasteAnchor} is doing the heavy lifting.`,
    ]);
  }

  if (isQuestion(lower)) {
    const fav = pick(songPool, `q-${seed}`);
    return choose([
      `Honestly? I’d start with “${fav.title}” by ${fav.artist} and answer from there.`,
      `Depends on the room, but “${fav.title}” usually decides it for me.`,
      `I’d say yes — especially if you’re building around ${tasteAnchor}.`,
    ]);
  }

  if (containsAny(lower, POSITIVE)) {
    return choose([
      `Glad we agree. ${tasteAnchor} is doing real work on this one.`,
      `Same energy here. You and ${matchPlaylistTitle || 'the mix'} are in sync today.`,
    ]);
  }

  if (containsAny(lower, NEGATIVE)) {
    return choose([
      `Fair. I’d cut it from the rotation too if I’m being honest.`,
      `I hear you — it doesn’t age the same as the rest of ${matchPlaylistTitle || 'the mix'}.`,
    ]);
  }

  if (trimmed.length < 18) {
    const rec = pick(songPool, `short-${seed}`);
    return choose([
      `Say more — where does “${rec.title}” fit for you?`,
      `I’m with you. Reminds me of ${rec.artist}, but warmer.`,
      `Keep going. That sounds like an opener.`,
    ]);
  }

  const rec = pick(songPool, `default-${seed}`);
  return choose([
    `That tracks. I hear the same thing in “${rec.title}” by ${rec.artist}.`,
    `Good read — your taste sits close to ${tasteAnchor}, with a sharper pop instinct.`,
    `That’s a playlist-person answer. I’d follow it with ${rec.artist} and see where it lands.`,
    ...fallbackReplies,
  ]);
}
