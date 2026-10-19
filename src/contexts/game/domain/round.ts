// Fases de una ronda de votación en la misma partida.
export const ROUND_PHASES = ['voting', 'counting', 'revealed'] as const;

export type RoundPhase = (typeof ROUND_PHASES)[number];
