import { describe, expect, it } from 'vitest';
import { hasVoted, type Participant } from '@/contexts/game/domain/participant';

describe('hasVoted', () => {
  it('should be true when the participant has a vote', () => {
    // Arrange
    const participant: Participant = { id: 'p1', name: 'Oscar', vote: '5' };

    // Act & Assert
    expect(hasVoted(participant)).toBe(true);
  });

  it('should be false when the participant has not voted', () => {
    // Arrange
    const participant: Participant = { id: 'p2', name: 'David', vote: null };

    // Act & Assert
    expect(hasVoted(participant)).toBe(false);
  });
});
