import type { Persona } from '../types';

export const DRY_PERSONAS: Persona[] = [
  {
    energy: 'dry',
    hedges: ['I guess', 'maybe', 'apparently'],
    openers: ['Hm', 'Okay', 'Sure'],
    affirmations: ['noted', 'fair', 'I’ll allow it'],
    questionStarters: ['Why', 'How come', 'Who'],
    closers: ['convince me otherwise.', 'filed for review.', 'do with that what you will.'],
    texture: ['slightly suspicious', 'oddly effective', 'unreasonably good'],
  },
  {
    energy: 'dry',
    hedges: ['allegedly', 'supposedly', 'in theory'],
    openers: ['Hm', 'Sure', 'Right'],
    affirmations: ['acceptable', 'I’ll allow it', 'fair enough'],
    questionStarters: ['And', 'But why', 'How does'],
    closers: ['explain yourself.', 'I’ll wait.', 'for the record.'],
    texture: ['dry', 'surprisingly sincere', 'not embarrassing'],
  },
];
