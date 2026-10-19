import type { CardValue } from '@/contexts/game/domain/card-deck';

export interface Participant {
  id: string;
  name: string;
  // Valor votado, o null si aún no vota. El número se muestra al revelar (otra HU).
  vote: CardValue | null;
}

export function hasVoted(participant: Participant): boolean {
  return participant.vote !== null;
}
