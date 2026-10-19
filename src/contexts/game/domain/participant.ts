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

// Devuelve una lista nueva con todos los votos en null (nueva ronda).
export function clearVotes(participants: readonly Participant[]): Participant[] {
  return participants.map((participant) => ({ ...participant, vote: null }));
}
