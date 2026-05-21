import type { ChatMessage, Match, Playlist, Song } from '../../data/demo';

export type ReplyInput = {
  message: string;
  match?: Match;
  playlists: Playlist[];
  history?: ChatMessage[];
  fallbackReplies: string[];
};

export type SongRef = Song & { playlist: string };

export type PersonaEnergy = 'warm' | 'dry' | 'analytical' | 'playful' | 'chill';

export type Persona = {
  energy: PersonaEnergy;
  hedges: string[];
  openers: string[];
  affirmations: string[];
  questionStarters: string[];
  closers: string[];
  texture: string[];
};

export type Scenario =
  | 'apology'
  | 'askMe'
  | 'boundary'
  | 'changeTopic'
  | 'checkIn'
  | 'compliment'
  | 'date'
  | 'deep'
  | 'defensive'
  | 'flirty'
  | 'hostile'
  | 'lyric'
  | 'profile'
  | 'teasing'
  | 'uncertainty'
  | 'weather'
  | 'whyMatch';
