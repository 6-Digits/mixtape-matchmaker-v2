import type { Match } from '../../data/demo';
import type { Persona } from './types';
import { hash } from './text';
import { DEFAULT_PERSONA, PERSONA_LIBRARY, PERSONA_OVERRIDES } from './personalities';

export function getPersona(match: Match | undefined): Persona {
  if (!match) return DEFAULT_PERSONA;
  const override = PERSONA_OVERRIDES[match.id];
  if (override !== undefined) return PERSONA_LIBRARY[override];
  return PERSONA_LIBRARY[hash(`${match.id}-${match.name}`) % PERSONA_LIBRARY.length];
}
