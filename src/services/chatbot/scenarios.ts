import type { Persona, Scenario } from './types';
import { pick } from './text';

const SCENARIO_REPLIES: Record<Scenario, Record<Persona['energy'], string[]>> = {
  apology: {
    analytical: ['No harm done. Text compresses tone badly.', 'All good. I’m updating the interpretation, not holding a grudge.'],
    chill: ['you’re good, no stress', 'all good. I didn’t take it weird.'],
    dry: ['Accepted. Ceremony waived.', 'Fine. I have survived worse messages.'],
    warm: ['You’re okay. I really didn’t take it badly.', 'No worries. I’d rather you say it than disappear into overthinking.'],
    playful: ['apology accepted, dramatic soundtrack optional', 'You’re forgiven. I expect one excellent song as reparations.'],
  },
  askMe: {
    analytical: ['What song do you think explains you most efficiently?', 'Which matters more to you: sequencing, lyrics, or production?'],
    chill: ['what song has been following you around lately?', 'what do you play when you want the day to calm down?'],
    dry: ['What is your most defensible bad opinion?', 'Which song would expose your taste immediately?'],
    warm: ['What song feels like home to you?', 'What song would you send someone you missed?'],
    playful: ['what song makes you instantly insufferable in the best way?', 'what is your no-skip, no-notes, defend-it-in-court song?'],
  },
  boundary: {
    analytical: ['Completely fair. I can recalibrate.', 'Understood. We can keep this slower and cleaner.'],
    chill: ['for sure. no pressure.', 'yeah, easy. we can keep it light.'],
    dry: ['Reasonable boundary. Noted without objection.', 'Fine by me. Consent remains fashionable.'],
    warm: ['Thank you for saying that. I respect it.', 'Totally. We can slow down and keep it comfortable.'],
    playful: ['Heard. I will lower the emotional volume.', 'Valid. I’ll put the aux down gently.'],
  },
  changeTopic: {
    analytical: ['Pivot accepted. New variable: what song changes your mood fastest?', 'New topic: what is your most over-defended album?'],
    chill: ['bet. new lane: morning music or night music?', 'random question then: what’s your comfort song?'],
    dry: ['Fine. New topic. Defend your most suspicious favorite.', 'A pivot. How sophisticated. Favorite skip?'],
    warm: ['Okay, fresh page. What song reminds you of being younger?', 'New topic: what song makes you feel known?'],
    playful: ['hard pivot, respect. what song would you play to cause mild chaos?', 'okay random: what track is your emotional support menace?'],
  },
  checkIn: {
    analytical: ['A little tired, but functional. I measured the day in songs and it came out okay.', 'Good enough. My brain is still rearranging a tracklist.'],
    chill: ['pretty good. slow day, good headphones.', 'I’m alright. needed a walk and one good song.'],
    dry: ['Alive. Mildly caffeinated. Acceptable.', 'Fine, against several odds.'],
    warm: ['I’m good, softer than usual today. Thanks for asking.', 'Honestly better now. How are you, really?'],
    playful: ['alive, dramatic, over-caffeinated. the usual.', 'I’m good. emotionally supervised by a playlist.'],
  },
  compliment: {
    analytical: ['That lands. I spend too much time on this stuff, so thank you.', 'High-value compliment. Accepted.'],
    chill: ['that’s nice, thank you. means a lot coming from you.', 'appreciate that. your taste is not exactly weak either.'],
    dry: ['Flattery logged. Continue.', 'Dangerous compliment. Unfortunately effective.'],
    warm: ['That genuinely made me smile.', 'Thank you. I’m a little too pleased about that.'],
    playful: ['Careful, I will become impossible.', 'wow okay, weaponized kindness.'],
  },
  date: {
    analytical: ['Coffee works. One song each, then we defend the sequencing.', 'Low-key is best. I want enough quiet to actually hear you.'],
    chill: ['coffee sounds good. somewhere easy, no performance.', 'I’m down. walk plus one shared playlist?'],
    dry: ['Coffee is acceptable. Dramatic lighting optional.', 'Fine. But if the cafe playlist is bad, we leave.'],
    warm: ['That sounds really nice. I’d like that.', 'A walk and coffee would be sweet. Simple is underrated.'],
    playful: ['yes, but only if we judge the cafe playlist together.', 'bold. I’m in. aux privileges to be negotiated.'],
  },
  deep: {
    analytical: ['I’m afraid of becoming too practical to notice beauty. That is unfortunately sincere.', 'A good memory: being quiet with someone while the right song did the talking.'],
    chill: ['I think I miss old versions of myself sometimes. music makes that less weird.', 'Big answer? I want a life that still has room for long walks.'],
    dry: ['My deepest fear is becoming someone who says "content" without irony. Also loneliness, probably.', 'I regret several haircuts and one playlist order. Only some of that is a joke.'],
    warm: ['I miss people in very specific songs. That’s probably why I care about playlists.', 'I want to be known gently. That’s the honest answer.'],
    playful: ['Deep cut: I’m scared my best stories are behind me. Rude, right?', 'Dream? A kitchen, good speakers, someone laughing at my worst jokes.'],
  },
  defensive: {
    analytical: ['I’m not trying to score points. I may have phrased that too sharply.', 'Fair pushback. I can separate your taste from the one opinion I disagreed with.'],
    chill: ['nah, I’m not judging you. I can back off that take.', 'you’re good. I meant it lighter than it probably read.'],
    dry: ['I was aiming for playful, not prosecution. Small but important distinction.', 'Noted. I can retire the cross-examination tone.'],
    warm: ['I’m sorry, I didn’t mean to make you feel judged.', 'I hear you. I care more about talking with you than being right.'],
    playful: ['okay fair, I got too spicy. lowering the take temperature.', 'I overplayed the bit. I can be normal for at least one message.'],
  },
  flirty: {
    analytical: ['That was smoother than expected. I’m noting it.', 'If this is playlist flirting, the structure is working.'],
    chill: ['okay, that worked a little', 'you’re kind of good at this, unfortunately'],
    dry: ['Careful. I am susceptible to competent banter.', 'That was almost charming. Troubling development.'],
    warm: ['That made me blush a little, not going to lie.', 'If you meant that as flirting, it landed.'],
    playful: ['oh you’re dangerous. noted.', 'playlist chemistry confirmed, please hold.'],
  },
  hostile: {
    analytical: ['I’m not going to match that energy, but I’m still open to talking if we reset.', 'That came in pretty sharp. I’d rather slow down than turn this into a fight.'],
    chill: ['okay, that felt harsh. I’m down to keep talking if we ease up.', 'I’m not trying to fight over a playlist. reset?'],
    dry: ['Hostile, but efficiently delivered. I’m going to choose the calmer branch.', 'We can continue, but I’m not doing combat texting.'],
    warm: ['That felt hurtful. I’m happy to keep talking if we can be kinder.', 'I don’t want this to turn mean. Let’s pause and reset.'],
    playful: ['oof, incoming damage. I’m putting the aux cord in timeout until we reset.', 'that got spicy in the wrong direction. truce?'],
  },
  lyric: {
    analytical: ['The bridge is where the argument resolves. That’s usually where I decide.', 'Production first, lyrics second, but the best songs make that distinction collapse.'],
    chill: ['the bassline is what gets me first, then the lyric sneaks up', 'yeah, the hook is doing a lot without trying too hard'],
    dry: ['The chorus is manipulative. Effective, but manipulative.', 'A good bridge can excuse several crimes.'],
    warm: ['The lyric matters when it feels like someone finally said the quiet part.', 'I love when a chorus arrives like relief.'],
    playful: ['the bridge is the emotional jump scare and I respect it', 'that hook is illegal. catchy in a suspicious way.'],
  },
  profile: {
    analytical: ['Short version: I overthink songs, under-explain feelings, and care about transitions.', 'I’m mostly looking for overlap that feels specific, not generic.'],
    chill: ['I’m pretty low-key. good songs, easy conversation, no weird pressure.', 'mostly here to trade music and see if the vibe is real.'],
    dry: ['I am a person with acceptable taste and several manageable flaws.', 'Bio version: skeptical, playlist-forward, occasionally charming by accident.'],
    warm: ['I’m soft about music and probably too sincere about little moments.', 'I’m looking for someone kind, curious, and specific about what they love.'],
    playful: ['I’m here to overreact to songs and pretend that counts as dating.', 'Profile summary: good hooks, bad impulse control, strong opinions.'],
  },
  teasing: {
    analytical: ['Hot take: most people confuse favorite songs with identity evidence.', 'Green flag: caring about transitions. Red flag: calling everything a vibe.'],
    chill: ['green flag: you let a song breathe. red flag: skipping before the chorus.', 'I’ll judge gently. probably.'],
    dry: ['Red flag: performative obscurity. Green flag: admitting the obvious song is good.', 'I can judge you, but I will need documentation.'],
    warm: ['Green flag: sending a song with context. Red flag: pretending not to care.', 'I can tease, but only lovingly.'],
    playful: ['red flag: no bridge appreciation. green flag: dramatic replay button usage.', 'I will judge, but with glitter.'],
  },
  uncertainty: {
    analytical: ['Uncertainty is useful. It means the take is still alive.', 'We can let it stay unresolved. Not everything needs a verdict.'],
    chill: ['that’s fine. some songs need a few listens.', 'idk is a valid music opinion sometimes'],
    dry: ['Ambivalence: the coward’s honesty. I respect it.', 'A non-position. Bold, in its way.'],
    warm: ['That’s okay. You don’t have to know yet.', 'Some things need time to become clear.'],
    playful: ['confusion is part of the listening experience, sadly', 'we’ll form an opinion eventually. or make it worse.'],
  },
  weather: {
    analytical: ['Weather changes tempo tolerance. This is my least casual belief.', 'Rain makes sparse production sound smarter.'],
    chill: ['that is absolutely slow-song weather', 'night air makes everything sound better'],
    dry: ['Weather: the original playlist algorithm.', 'Rain does make everyone more dramatic. Annoying but true.'],
    warm: ['Rain makes me softer. I always pick the tender song.', 'Night makes certain songs feel like secrets.'],
    playful: ['rain is just the sky asking for a sad playlist', 'night music is legally stronger than day music.'],
  },
  whyMatch: {
    analytical: ['The overlap is structural: pacing, drama, and restraint in similar places.', 'I think we match because we both treat sequencing like evidence.'],
    chill: ['I think we match because your taste feels easy to talk to.', 'same mood, different routes. that’s usually the good version.'],
    dry: ['Apparently the algorithm detected mutual playlist damage.', 'We both seem picky in compatible ways. Concerning, but useful.'],
    warm: ['I think our songs want the same kind of feeling.', 'It feels like we both listen for the emotional middle, not just the hook.'],
    playful: ['because the playlist gods enjoy drama', 'because we both seem like we’d overthink the same chorus.'],
  },
};

export function scenarioReply(scenario: Scenario, persona: Persona, seed: string, replacements?: Record<string, string>) {
  let reply = pick(SCENARIO_REPLIES[scenario][persona.energy], `scenario-${scenario}-${seed}`);
  for (const [key, value] of Object.entries(replacements || {})) {
    reply = reply.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return reply;
}
