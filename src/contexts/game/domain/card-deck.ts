// Baraja de estimación: serie de Fibonacci sin el 0 y sin el 1 duplicado.
export const CARD_DECK = ['1', '2', '3', '5', '8', '13', '21'] as const;

export type CardValue = (typeof CARD_DECK)[number];
