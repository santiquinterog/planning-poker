import { describe, expect, it } from 'vitest';
import {
  allVoted,
  averageVote,
  computeVoteResults,
  formatAverage,
  tallyVotes,
} from '@/contexts/game/domain/vote-results';
import type { Participant } from '@/contexts/game/domain/participant';

const VOTED: Participant[] = [
  { id: '1', name: 'Oscar', vote: '3' },
  { id: '2', name: 'David', vote: '21' },
  { id: '3', name: 'Albert', vote: '13' },
  { id: '4', name: 'Pedro', vote: '13' },
  { id: '5', name: 'Nata', vote: '13' },
  { id: '6', name: 'Carlos', vote: '21' },
  { id: '7', name: 'Vale', vote: '5' },
];

describe('allVoted', () => {
  it('should be true when every participant has voted', () => {
    expect(allVoted(VOTED)).toBe(true);
  });

  it('should be false when someone has not voted', () => {
    expect(allVoted([...VOTED, { id: '8', name: 'Ana', vote: null }])).toBe(false);
  });

  it('should be false when there are no participants', () => {
    expect(allVoted([])).toBe(false);
  });
});

describe('tallyVotes', () => {
  it('should count votes per value ordered by the deck', () => {
    // Arrange & Act
    const tallies = tallyVotes(VOTED);

    // Assert
    expect(tallies).toEqual([
      { value: '3', count: 1 },
      { value: '5', count: 1 },
      { value: '13', count: 3 },
      { value: '21', count: 2 },
    ]);
  });
});

describe('averageVote', () => {
  it('should average the numeric votes', () => {
    // (3+21+13+13+13+21+5)/7 = 89/7 = 12.71...
    expect(averageVote(VOTED)).toBeCloseTo(12.714, 2);
  });

  it('should be 0 when nobody voted', () => {
    expect(averageVote([{ id: '1', name: 'Ana', vote: null }])).toBe(0);
  });
});

describe('formatAverage', () => {
  it('should format with one decimal and a comma', () => {
    expect(formatAverage(12.714)).toBe('12,7');
  });
});

describe('computeVoteResults', () => {
  it('should combine tallies and average', () => {
    // Arrange & Act
    const results = computeVoteResults(VOTED);

    // Assert
    expect(results.tallies).toHaveLength(4);
    expect(formatAverage(results.average)).toBe('12,7');
  });
});
