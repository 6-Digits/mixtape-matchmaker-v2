import type { ChatMessage, Match } from '../../data/demo';
import {
  APOLOGY,
  ASK_ME,
  BOUNDARY,
  CHANGE_TOPIC,
  CHECK_IN,
  COMPLIMENT,
  DATE_PROMPTS,
  DEEP_QUESTION,
  DEFENSIVE,
  FLIRTY,
  HOSTILE,
  LYRIC_MOMENT,
  NEGATIVE,
  POSITIVE,
  PROFILE_PROMPTS,
  TEASING,
  UNCERTAINTY,
  WEATHER_TIME,
  WHY_MATCH,
} from './triggers';
import { scenarioReply } from './scenarios';
import { containsAny, pick } from './text';
import type { Persona, SongRef } from './types';

const TOPIC_STOP_WORDS = new Set([
  'about', 'after', 'again', 'also', 'because', 'before', 'could', 'doing', 'feel',
  'heard', 'maybe', 'music', 'playlist', 'really', 'should', 'sound', 'still',
  'their', 'there', 'think', 'track', 'what', 'where', 'which', 'would', 'your',
]);

export type ScenarioContext = {
  affirm: string;
  hedge: string;
  history?: ChatMessage[];
  match?: Match;
  matchPlaylistTitle?: string;
  mentionedSong?: SongRef;
  opener: string;
  persona: Persona;
  seed: string;
  songPool: SongRef[];
  tasteAnchor: string;
};

export function routeScenario(lower: string) {
  if (containsAny(lower, HOSTILE)) return 'hostile';
  if (containsAny(lower, DEFENSIVE)) return 'defensive';
  if (containsAny(lower, PROFILE_PROMPTS)) return 'profile';
  if (containsAny(lower, WHY_MATCH)) return 'whyMatch';
  if (containsAny(lower, DATE_PROMPTS)) return 'date';
  if (containsAny(lower, CHECK_IN)) return 'checkIn';
  if (containsAny(lower, COMPLIMENT)) return 'compliment';
  if (containsAny(lower, FLIRTY)) return 'flirty';
  if (containsAny(lower, APOLOGY)) return 'apology';
  if (containsAny(lower, BOUNDARY)) return 'boundary';
  if (containsAny(lower, UNCERTAINTY)) return 'uncertainty';
  if (containsAny(lower, DEEP_QUESTION)) return 'deep';
  if (containsAny(lower, ASK_ME)) return 'askMe';
  if (containsAny(lower, TEASING)) return 'teasing';
  if (containsAny(lower, CHANGE_TOPIC)) return 'changeTopic';
  if (containsAny(lower, WEATHER_TIME)) return 'weather';
  if (containsAny(lower, LYRIC_MOMENT)) return 'lyric';
  return null;
}

export function buildScenarioReply(scenario: NonNullable<ReturnType<typeof routeScenario>>, context: ScenarioContext) {
  const { affirm, hedge, history, match, matchPlaylistTitle, mentionedSong, opener, persona, seed, songPool, tasteAnchor } = context;
  const rec = pick(songPool, `${scenario}-${seed}`);
  const base = scenarioReply(scenario, persona, seed);
  const recalled = recallUserTopic(history);

  const options: Record<typeof scenario, string[]> = {
    apology: [base, 'You’re okay. I didn’t take it badly.', 'No stress. Tone is weird over text, especially when we’re both talking in playlist metaphors.'],
    askMe: [base, `If “${rec.title}” came on while we were out, would you let it play or skip it?`],
    boundary: [base, 'Totally fair. We can slow it down.', 'That’s valid. Let’s keep it easy and music-first.'],
    changeTopic: [base, recalled ? `Different topic, but I’m still thinking about what you said around ${recalled}.` : 'Different topic accepted. I like conversational left turns.'],
    checkIn: [base, `Pretty good. ${match?.location || 'my side of town'} was loud today, so I came home and put on “${rec.title}.”`, 'Good, in a quiet way. How are you actually doing?'],
    compliment: [base, `${opener}, that actually made me smile. I take playlist compliments very seriously.`, 'Thank you. Coming from someone with your taste, that counts extra.'],
    date: [base, `I’d do coffee, but only if we each bring one song. Mine would probably be “${rec.title}.”`, `Weekend could work. I’m imagining a walk, then arguing gently about whether ${rec.artist} belongs on a first-date mix.`],
    deep: [base, `I believe in timing more than fate. “${rec.title}” is a timing song for me.`],
    defensive: [base, `I can own my side. I was talking about the take, not you. “${rec.title}” is probably a safer subject than my delivery.`, `Fair. I’ll drop the debate voice. I’d rather understand why ${tasteAnchor} matters to you.`],
    flirty: [base, `Bold. I’d respond with “${rec.title}” and let the subtext do its job.`],
    hostile: [base, `I’m going to take a beat instead of firing back. If you want to reset, send me one song and I’ll meet you there.`, `That landed rough. I’m still here, but I need the tone to come down before we keep going.`],
    lyric: [base, mentionedSong ? `The bridge is where I decide if I trust a song. “${mentionedSong.title}” passes.` : `${hedge}, the production is doing half the emotional work there.`],
    profile: [base, `${opener}. ${humanAside(match, persona, seed)}`, `Short version: ${humanAside(match, persona, `short-${seed}`)}`],
    teasing: [base, `I will roast gently: if you skip “${rec.title},” I need a written explanation.`],
    uncertainty: [base, `Then we can test it with “${rec.title}.” Some opinions need a soundtrack first.`],
    weather: [base, `That is exactly “${rec.title}” weather.`, `Morning version of me would answer differently. Night version says ${rec.artist}.`],
    whyMatch: [base, `I think it’s the ${profileTags(match, []).slice(0, 2).join(' and ') || tasteAnchor}. Your taste feels close to “${rec.title}” without copying it.`, `${affirm}. ${matchPlaylistTitle || 'My playlist'} and yours both know when to get dramatic.`],
  };
  return pick(options[scenario], `scenario-extra-${scenario}-${seed}`);
}

export function moodReplies(mood: string, rec: SongRef, affirm: string) {
  const replies: Record<string, string[]> = {
    chill: [`Then “${rec.title}” by ${rec.artist} — keeps the room low.`, `Same. I land on “${rec.title}” when I want it softer.`],
    hype: [`For loud, “${rec.title}” still goes harder than it should.`, `${affirm}. “${rec.title}” by ${rec.artist} is the right energy.`],
    sad: [`“${rec.title}” by ${rec.artist}. The one I put on for that.`, `Same lane — I lean on “${rec.title}” when it gets like that.`],
    romantic: [`“${rec.title}” basically writes the moment for you.`, `Try “${rec.title}.” ${rec.artist} sells it without overdoing it.`],
    drive: [`Highway pick: “${rec.title}.” Windows down, ${rec.artist} doing the rest.`, `If I’m driving, “${rec.title}” every time.`],
    focus: [`For focus I’d put on “${rec.title}.” ${rec.artist} doesn’t pull the cursor.`, `Loop “${rec.title}” quietly — gets me through long stretches.`],
  };
  return replies[mood] || replies.chill;
}

export function songMentionReply(
  args: { affirm: string; hedge: string; lower: string; mentionedSong: SongRef; tasteAnchor: string },
  appendFollowUp: (reply: string) => string,
  choose: (options: string[]) => string,
) {
  const { affirm, hedge, lower, mentionedSong, tasteAnchor } = args;
  if (containsAny(lower, NEGATIVE)) {
    return choose([`Fair — “${mentionedSong.title}” is divisive. I’d swap it for something from ${tasteAnchor}.`, `${hedge}, the ${mentionedSong.year} production on “${mentionedSong.title}” doesn’t land for everyone.`]);
  }
  if (containsAny(lower, POSITIVE)) {
    return appendFollowUp(choose([`Right? “${mentionedSong.title}” is the high point on ${mentionedSong.playlist}.`, `${affirm}. ${mentionedSong.artist} never misses next to ${tasteAnchor}.`, `Same — “${mentionedSong.title}” is why I keep that side of the mix.`]));
  }
  return appendFollowUp(choose([`“${mentionedSong.title}” pairs well with ${tasteAnchor} — try it after a ${mentionedSong.artist} cut.`, `The ${mentionedSong.year} version still holds up. Sits weird if you put it earlier.`, `I’d put “${mentionedSong.title}” mid-playlist so it lands as the turn.`]));
}

export function positiveReplies(echo: string | null, tasteAnchor: string, matchPlaylistTitle?: string) {
  return [
    echo ? `Glad we agree on ${echo}. ${tasteAnchor} is doing real work.` : `Glad we agree. ${tasteAnchor} is doing real work.`,
    echo ? `Yeah, ${echo} lands the same way for me.` : `Same energy. You and ${matchPlaylistTitle || 'the mix'} are in sync today.`,
    echo ? `Right? ${echo} is the part I keep coming back to.` : 'Right? That’s the part I keep coming back to.',
  ];
}

export function negativeReplies(echo: string | null, hedge: string, tasteAnchor: string, matchPlaylistTitle?: string) {
  return [
    echo ? `Fair — ${echo} doesn’t do it for me either.` : 'Fair. I’d cut it from rotation too.',
    echo ? `${hedge}, ${echo} hasn’t aged the way the rest has.` : `${hedge}, it doesn’t age the same as the rest of ${matchPlaylistTitle || 'the mix'}.`,
    echo ? `I’ll swap ${echo} out — got something closer to ${tasteAnchor} in mind.` : `I’d swap that one out — something closer to ${tasteAnchor} probably.`,
  ];
}

export function defaultReplies(args: { echo: string | null; fallbackReplies: string[]; matchPlaylistTitle?: string; opener: string; rec: SongRef; tasteAnchor: string; turns: number }) {
  const { echo, fallbackReplies, matchPlaylistTitle, opener, rec, tasteAnchor, turns } = args;
  const replies = turns > 3
    ? [
        echo ? `${opener}. ${echo} keeps coming up between us — there's a thread.` : `${opener}. I'm noticing a thread — ${tasteAnchor} keeps coming up between us.`,
        echo ? `Half of what you’re saying about ${echo} lives in ${matchPlaylistTitle || 'that mix'}.` : `Half of what you’re describing lives in ${matchPlaylistTitle || 'that mix'}.`,
      ]
    : [
        echo ? `On ${echo}, I hear the same thing in “${rec.title}.”` : `I hear the same thing in “${rec.title}” by ${rec.artist}.`,
        echo ? `Good read on ${echo} — your taste sits close to ${tasteAnchor}.` : `Good read — your taste sits close to ${tasteAnchor}, with a sharper pop instinct.`,
        echo ? `That’s the ${echo} take I was hoping for. I’d follow it with ${rec.artist}.` : `That’s a playlist-person answer. I’d follow it with ${rec.artist} and see where it lands.`,
      ];
  return [...replies, ...fallbackReplies];
}

function profileTags(match: Match | undefined, tasteArtists: string[]) {
  return match?.profileTags?.length ? match.profileTags : tasteArtists.slice(0, 3);
}

function humanAside(match: Match | undefined, persona: Persona, seed: string) {
  const tag = pick(profileTags(match, []), `tag-${seed}`, '');
  const texture = pick(persona.texture, `tex-${seed}`);
  return pick([
    match?.bio ? match.bio : `I’m mostly here for ${texture} songs and low-pressure conversation.`,
    match?.lookingFor ? match.lookingFor : 'Someone who trades songs instead of performing small talk.',
    match?.location ? `${match.location} has me overusing night-walk playlists lately.` : `My current taste is ${texture}, probably to a fault.`,
    tag ? `My profile says ${tag}, which is only slightly embarrassing.` : 'I’m better at playlists than bios.',
  ], `aside-${seed}`);
}

function recallUserTopic(history: ChatMessage[] | undefined) {
  const recent = (history || []).filter((message) => message.from === 'You').slice(-4).reverse();
  for (const message of recent) {
    const fragment = topicFragment(message.body);
    if (fragment && fragment.length > 3) return fragment;
  }
  return null;
}

function topicFragment(text: string) {
  const words = text.toLowerCase().replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean);
  return words.filter((word) => word.length > 3 && !TOPIC_STOP_WORDS.has(word)).at(-1) ?? null;
}
