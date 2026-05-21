import type { ChatMessage } from '../data/demo';
import { getPersona } from './chatbot/personas';
import {
  buildScenarioReply,
  defaultReplies,
  moodReplies,
  negativeReplies,
  positiveReplies,
  routeScenario,
  songMentionReply,
} from './chatbot/replyBuilders';
import { containsAny, hash, pick } from './chatbot/text';
import {
  AGREES,
  DISCLOSURES,
  FAREWELLS,
  GREETINGS,
  LAUGHS,
  MOOD_ARTIST_RE,
  MOOD_WORDS,
  MUSIC_ACTIVITY,
  NEGATIVE,
  OPINION_PROMPTS,
  POSITIVE,
  RECOMMEND,
  THANKS,
} from './chatbot/triggers';
import type { Persona, ReplyInput, SongRef } from './chatbot/types';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'so', 'for', 'to', 'of', 'on', 'in', 'at', 'is', 'it',
  'was', 'were', 'be', 'been', 'are', 'as', 'this', 'that', 'these', 'those', 'i', 'you', 'we', 'they',
  'my', 'your', 'our', 'their', 'me', 'him', 'her', 'them', 'do', 'does', 'did', 'have', 'has', 'had',
  'will', 'would', 'should', 'could', 'can', 'just', 'really', 'like', 'with', 'about', 'what', 'when',
  'where', 'how', 'why', 'who', 'which', 'too', 'very', 'much', 'many', 'some', 'any', 'all', 'into',
  'out', 'up', 'down', 'over', 'under', 'than', 'then', 'from', 'by', 'because',
]);

function isQuestion(lower: string) {
  return lower.includes('?')
    || /^(what|why|how|when|where|who|which|do you|have you|are you|is it|can you|would you|should i|did you)\b/.test(lower.trim());
}

function detectMood(lower: string): string | null {
  for (const [mood, words] of Object.entries(MOOD_WORDS)) {
    if (containsAny(lower, words)) return mood;
  }
  return null;
}

function songsForMood(mood: string, songs: SongRef[]) {
  const re = MOOD_ARTIST_RE[mood];
  if (!re) return songs;
  const matching = songs.filter((song) => re.test(song.artist) || re.test(song.title));
  return matching.length > 0 ? matching : songs;
}

function findMentionedSong(lower: string, allSongs: SongRef[]) {
  return allSongs.find((song) => {
    const title = song.title.toLowerCase();
    const artist = song.artist.toLowerCase();
    return (title.length > 3 && lower.includes(title))
      || (artist.length > 3 && lower.includes(artist));
  });
}

function lastFromMatch(history: ChatMessage[] | undefined, matchName: string) {
  if (!history?.length) return undefined;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i].from === matchName) return history[i].body;
  }
  return undefined;
}

function recentTopic(history: ChatMessage[] | undefined, allSongs: SongRef[]) {
  if (!history?.length) return undefined;
  const recent = history.slice(-6).map((message) => message.body.toLowerCase()).join(' ');
  return findMentionedSong(recent, allSongs);
}

function userTurnsCount(history: ChatMessage[] | undefined) {
  return history?.filter((message) => message.from === 'You').length ?? 0;
}

function matchAskedRecently(history: ChatMessage[] | undefined, matchName: string) {
  return Boolean(history?.slice(-2).some((message) => message.from === matchName && message.body.includes('?')));
}

function tokenWords(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean);
}

function keyNoun(text: string) {
  const words = tokenWords(text).filter((word) => word.length > 3 && !STOP_WORDS.has(word));
  return words.at(-1) ?? null;
}

function echoFragment(message: string) {
  const noun = keyNoun(message);
  if (!noun) return null;
  const match = message.match(new RegExp(`\\b${noun.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i'));
  return match ? match[0] : noun;
}

function detectSelfDisclosure(lower: string) {
  return DISCLOSURES.some((disclosure) => lower.includes(disclosure));
}

function maybeQuestion(persona: Persona, seed: string, allSongs: SongRef[]) {
  const starter = pick(persona.questionStarters, `q-${seed}`);
  const song = pick(allSongs, `qs-${seed}`);
  return pick([
    `${starter} you had to open a playlist for tonight — would it be “${song.title}”?`,
    `${starter} listened to ${song.artist} on the way over?`,
    `${starter} put “${song.title}” at the end of a mix instead of the front?`,
    `${starter} a song you keep coming back to lately?`,
  ], `qv-${seed}`);
}

function varyLength(reply: string, persona: Persona, seed: string) {
  const roll = hash(`len-${seed}`) % 100;
  if (roll < 18) return reply.replace(/\s+(honestly|genuinely|low-key|lowkey|arguably|technically),?/i, '').trim();
  if (roll < 58) return reply;
  return `${reply} ${pick(persona.closers, `closer-${seed}`)}`;
}

function softenRealism(reply: string, persona: Persona, seed: string) {
  const roll = hash(`real-${seed}`) % 100;
  if (roll < 12) return `${reply} also this may be a very specific take.`;
  if (roll < 22) return `${reply} wait, that sounded more serious than I meant it.`;
  if (roll < 32 && persona.energy !== 'analytical') return `${reply} idk if that makes sense.`;
  return reply;
}

function trimEcho(reply: string, lastReply?: string) {
  if (!lastReply) return reply;
  if (reply.trim().toLowerCase() === lastReply.trim().toLowerCase()) return `${reply} (still thinking on it.)`;
  return reply;
}

export function createLocalMatchReply({ message, match, playlists, history, fallbackReplies }: ReplyInput) {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();
  const tokens = tokenWords(trimmed);
  const matchName = match?.name || 'Your match';
  const matchPlaylistTitle = match?.playlist;
  const allSongs: SongRef[] = playlists.flatMap((playlist) => playlist.songs.map((song) => ({ ...song, playlist: playlist.title })));
  const matchPlaylist = playlists.find((playlist) => playlist.title === matchPlaylistTitle);
  const tasteArtists = (match?.taste || 'your playlist').split(',').map((taste) => taste.trim()).filter(Boolean);
  const songPool = matchPlaylist ? matchPlaylist.songs.map((song) => ({ ...song, playlist: matchPlaylist.title })) : allSongs;
  const persona = getPersona(match);
  const turns = userTurnsCount(history);
  const lastReply = lastFromMatch(history, matchName);
  const seed = `${trimmed}-${matchName}-${turns}`;
  const tasteAnchor = tasteArtists.length > 0 ? pick(tasteArtists, seed) : 'your sound';
  const opener = pick(persona.openers, `open-${seed}`);
  const hedge = pick(persona.hedges, `hedge-${seed}`);
  const affirm = pick(persona.affirmations, `aff-${seed}`);
  const mentionedSong = findMentionedSong(lower, allSongs);
  const topic = mentionedSong ?? recentTopic(history, allSongs);
  const mood = detectMood(lower);
  const shouldFollowUp = (hash(`fu-${seed}`) % 100) / 100 < (matchAskedRecently(history, matchName) ? 0.18 : 0.36);
  const choose = (options: string[]) => trimEcho(pick(options, seed, lastReply), lastReply);
  const finish = (reply: string) => trimEcho(softenRealism(varyLength(reply, persona, seed), persona, seed), lastReply);
  const appendFollowUp = (reply: string) => shouldFollowUp ? `${reply} ${maybeQuestion(persona, `fu-${seed}`, songPool)}` : reply;

  if (containsAny(lower, GREETINGS) && trimmed.length < 22) {
    return finish(appendFollowUp(choose([
      `${opener} — ${turns === 0 ? 'glad you said hi.' : 'good to hear from you again.'}`,
      `Hey. ${tasteAnchor} has been on repeat over here.`,
      `${opener}. I was about to queue ${matchPlaylistTitle || 'something'} again.`,
      `Hey ${turns === 0 ? 'new playlist person' : 'again'} — I was hoping you’d message.`,
    ])));
  }

  if (containsAny(lower, FAREWELLS)) {
    return finish(choose([
      'Catch you. I’ll send a track before you’re back.',
      `Talk soon — sitting with ${matchPlaylistTitle || 'this mix'} for a bit.`,
      `Night. Closing on “${pick(songPool, seed).title}.”`,
    ]));
  }

  const scenario = routeScenario(lower);
  if (scenario) {
    return finish(buildScenarioReply(scenario, {
      affirm,
      hedge,
      history,
      match,
      matchPlaylistTitle,
      mentionedSong,
      opener,
      persona,
      seed,
      songPool,
      tasteAnchor,
    }));
  }

  if (containsAny(lower, THANKS)) {
    return finish(choose([
      `Anytime — we overlap on ${tasteAnchor}, easy.`,
      'Of course. Your taste makes it easy.',
      `${affirm}. I’m taking notes too.`,
    ]));
  }

  if (containsAny(lower, LAUGHS) && trimmed.length < 30) {
    return finish(choose([
      'Right? I needed to share that.',
      'Glad we’re on the same wavelength.',
      `${opener}, I knew you’d get it.`,
      'Okay good, I was hoping that landed.',
    ]));
  }

  if (containsAny(lower, AGREES) && trimmed.length < 30) {
    return finish(choose([
      `${affirm}. Especially on the back half of ${matchPlaylistTitle || 'that mix'}.`,
      `Glad we line up here. ${tasteAnchor} is doing real work.`,
      `${opener}. Was hoping you’d say that.`,
    ]));
  }

  if (containsAny(lower, RECOMMEND) || /^what (should|do) (i|you)/.test(lower)) {
    const rec = pick(mood ? songsForMood(mood, songPool) : songPool, `rec-${seed}`);
    return finish(appendFollowUp(choose([
      `Try “${rec.title}” by ${rec.artist}. Sits right next to ${tasteAnchor}.`,
      `${hedge}, “${rec.title}” is the move. ${rec.artist} fits ${matchPlaylistTitle || 'your mix'} cleanly.`,
      `Put on “${rec.title}.” It’s the one I keep coming back to in that lane.`,
    ])));
  }

  if (containsAny(lower, OPINION_PROMPTS)) {
    const rec = pick(songPool, `op-${seed}`);
    return finish(choose([
      `${hedge} — I’d defend “${rec.title}” to the end. ${rec.artist} just nails the texture.`,
      `Strong yes. The ${rec.year} cuts still beat half of what’s on the radio now.`,
      `Mixed feelings, but “${rec.title}” always wins me back.`,
    ]));
  }

  if (mood) {
    const rec = pick(songsForMood(mood, songPool), `mood-${seed}`);
    return finish(appendFollowUp(choose(moodReplies(mood, rec, affirm))));
  }

  if (mentionedSong) {
    return finish(songMentionReply({ affirm, hedge, lower, mentionedSong, tasteAnchor }, appendFollowUp, choose));
  }

  if (containsAny(lower, ['favorite', 'best', 'top'])) {
    const fav = pick(songPool, `fav-${seed}`);
    return finish(choose([
      `Top pick is “${fav.title}.” ${fav.artist} pins the whole feeling down.`,
      `${hedge}, “${fav.title}” — the one I’d open with if I rebuilt ${matchPlaylistTitle || 'it'}.`,
      `If I have to choose, “${fav.title}.” Not because it is obvious, because it holds the room.`,
    ]));
  }

  if (containsAny(lower, MUSIC_ACTIVITY)) {
    const rec = pick(songPool, `activity-${seed}`);
    return finish(appendFollowUp(choose([
      `I’m listening to “${rec.title}” right now, actually. It’s making my room feel more expensive than it is.`,
      `Queued “${rec.title}” after your message. ${rec.artist} still has that ${pick(persona.texture, `act-tex-${seed}`)} thing.`,
      `I was on ${matchPlaylistTitle || 'my mix'} earlier. “${rec.title}” got replayed, no surprise.`,
    ])));
  }

  if (containsAny(lower, ['playlist', 'mix', 'mixtape', 'tracklist'])) {
    const fav = pick(songPool, `mix-${seed}`);
    return finish(appendFollowUp(choose([
      `Your sequencing feels intentional. “${fav.title}” belongs in the back half.`,
      `I’d keep ${matchPlaylistTitle || 'the mix'} but move “${fav.title}” up two slots.`,
      `${affirm}. The mix tells a real story — ${tasteAnchor} carries it.`,
    ])));
  }

  if (detectSelfDisclosure(lower)) {
    const rec = pick(songPool, `sd-${seed}`);
    return finish(choose([
      `${opener}. I hear that. “${rec.title}” has been my version of it.`,
      `Felt. ${hedge}, that sounds like a ${rec.artist} kind of week.`,
      `Same energy. I reach for “${rec.title}” when it gets like that.`,
      `I get that. Not in a dramatic way, just... yeah. ${rec.artist} has a lane for that.`,
    ]));
  }

  const echo = echoFragment(trimmed);
  if (isQuestion(lower)) {
    const fav = pick(songPool, `q-${seed}`);
    return finish(choose([
      echo ? `${hedge}, on ${echo}? I’d start with “${fav.title}.”` : `${hedge}, I’d start with “${fav.title}” by ${fav.artist} and answer from there.`,
      echo ? `Depends — if ${echo} is the angle, “${fav.title}” usually decides it for me.` : `Depends on the room, but “${fav.title}” usually decides it for me.`,
      echo ? `Yeah, ${echo} pulls me toward ${tasteAnchor} every time.` : `${affirm}, especially if you’re building around ${tasteAnchor}.`,
    ]));
  }

  if (containsAny(lower, POSITIVE)) return finish(appendFollowUp(choose(positiveReplies(echo, tasteAnchor, matchPlaylistTitle))));
  if (containsAny(lower, NEGATIVE)) return finish(choose(negativeReplies(echo, hedge, tasteAnchor, matchPlaylistTitle)));
  if (topic) return finish(choose([`Going back to “${topic.title}” — I still think that’s the strongest cut.`, `${affirm} on “${topic.title}.” It’s the anchor of the whole conversation.`]));

  if (trimmed.length < 18 || tokens.length < 4) {
    const rec = pick(songPool, `short-${seed}`);
    return finish(choose([`Say more — where does “${rec.title}” fit for you?`, `${opener}. Reminds me of ${rec.artist}, but warmer.`, 'Keep going. That sounds like an opener.']));
  }

  const rec = pick(songPool, `default-${seed}`);
  return finish(appendFollowUp(choose(defaultReplies({ echo, fallbackReplies, matchPlaylistTitle, opener, rec, tasteAnchor, turns }))));
}
