import type { Persona } from '../types';

export const ANALYTICAL_PERSONAS: Persona[] = [
  {
    energy: 'analytical',
    hedges: ['arguably', 'I’d say', 'kind of'],
    openers: ['Right', 'Sure', 'Okay'],
    affirmations: ['agreed', 'fair', 'makes sense'],
    questionStarters: ['What about', 'Have you considered', 'Do you think'],
    closers: ['what would you change?', 'what’s your sequencing logic?', 'am I overthinking it?'],
    texture: ['specific', 'well-sequenced', 'quietly ambitious'],
  },
  {
    energy: 'analytical',
    hedges: ['technically', 'though', 'still'],
    openers: ['So', 'Right', 'Okay'],
    affirmations: ['yeah that tracks', 'fair point', 'agreed'],
    questionStarters: ['What if', 'Why not', 'Have you mapped'],
    closers: ['what’s the counterpoint?', 'where do you put it?', 'does that scan?'],
    texture: ['structured', 'deliberate', 'clean'],
  },
  {
    energy: 'analytical',
    hedges: ['arguably', 'though', 'I’d argue'],
    openers: ['Okay', 'So', 'Right'],
    affirmations: ['agreed', 'precisely', 'yeah'],
    questionStarters: ['Have you considered', 'Counterpoint', 'What if'],
    closers: ['what’s your read?', 'where would you slot it?', 'that’s my thesis anyway.'],
    texture: ['careful', 'textured', 'intentional'],
  },
];
