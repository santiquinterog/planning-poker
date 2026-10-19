import { describe, expect, it } from 'vitest';
import { clearVotes, hasVoted, type Participant } from '@/contexts/game/domain/participant';

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

describe('clearVotes', () => {
  it('should set every vote to null', () => {
    // Arrange
    const participants: Participant[] = [
      { id: 'p1', name: 'Oscar', vote: '5' },
      { id: 'p2', name: 'David', vote: '8' },
    ];

    // Act
    const cleared = clearVotes(participants);

    // Assert
    expect(cleared).toEqual([
      { id: 'p1', name: 'Oscar', vote: null },
      { id: 'p2', name: 'David', vote: null },
    ]);
  });

  it('should not mutate the original participants', () => {
    // Arrange
    const participants: Participant[] = [{ id: 'p1', name: 'Oscar', vote: '5' }];

    // Act
    clearVotes(participants);

    // Assert
    expect(participants[0].vote).toBe('5');
  });
});
