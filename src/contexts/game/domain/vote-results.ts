import { CARD_DECK, type CardValue } from '@/contexts/game/domain/card-deck';
import { hasVoted, type Participant } from '@/contexts/game/domain/participant';

export interface VoteTally {
  value: CardValue;
  count: number;
}

export interface VoteResults {
  tallies: VoteTally[];
  average: number;
}

export function allVoted(participants: readonly Participant[]): boolean {
  return participants.length > 0 && participants.every(hasVoted);
}

// Distribución de votos ordenada por el orden de la baraja, solo con los valores votados.
export function tallyVotes(participants: readonly Participant[]): VoteTally[] {
  const counts = new Map<CardValue, number>();
  for (const participant of participants) {
    if (participant.vote !== null) {
      counts.set(participant.vote, (counts.get(participant.vote) ?? 0) + 1);
    }
  }
  return CARD_DECK.filter((value) => counts.has(value)).map((value) => ({
    value,
    count: counts.get(value) ?? 0,
  }));
}

// Promedio de los votos numéricos. 0 si nadie votó.
export function averageVote(participants: readonly Participant[]): number {
  const votes = participants
    .map((participant) => participant.vote)
    .filter((vote): vote is CardValue => vote !== null)
    .map(Number);
  if (votes.length === 0) {
    return 0;
  }
  const sum = votes.reduce((total, vote) => total + vote, 0);
  return sum / votes.length;
}

export function computeVoteResults(participants: readonly Participant[]): VoteResults {
  return { tallies: tallyVotes(participants), average: averageVote(participants) };
}

// Formato español con un decimal y coma: 12.666 -> "12,7". Independiente del locale del entorno.
export function formatAverage(average: number): string {
  return average.toFixed(1).replace('.', ',');
}
