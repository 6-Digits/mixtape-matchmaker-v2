import type { Persona } from '../types';
import { ANALYTICAL_PERSONAS } from './analytical';
import { CHILL_PERSONAS } from './chill';
import { DEFAULT_PERSONA } from './defaultPersona';
import { DRY_PERSONAS } from './dry';
import { PLAYFUL_PERSONAS } from './playful';
import { WARM_PERSONAS } from './warm';

export { DEFAULT_PERSONA };

export const PERSONA_LIBRARY: Persona[] = [
  ANALYTICAL_PERSONAS[0],
  CHILL_PERSONAS[0],
  DRY_PERSONAS[0],
  WARM_PERSONAS[0],
  PLAYFUL_PERSONAS[0],
  ANALYTICAL_PERSONAS[1],
  WARM_PERSONAS[1],
  PLAYFUL_PERSONAS[1],
  CHILL_PERSONAS[1],
  DRY_PERSONAS[1],
  WARM_PERSONAS[2],
  ANALYTICAL_PERSONAS[2],
];

export const PERSONA_OVERRIDES: Record<string, number> = {
  jason: 0,
  farhan: 1,
  darren: 2,
  'maya-match': 3,
  'alex-match': 8,
  'sam-match': 4,
  'lena-match': 6,
  new: 10,
  'jordan-match': 4,
  'priya-match': 11,
  'theo-match': 9,
  'iris-match': 5,
  'quinn-match': 2,
  'riley-match': 7,
};
