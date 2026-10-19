import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useParticipantsVm } from '@/contexts/game/hooks/useParticipantsVm';
import { hasVoted } from '@/contexts/game/domain/participant';
import type { Participant } from '@/contexts/game/domain/participant';

const SOURCE: Participant[] = [
  { id: 'p1', name: 'Oscar', vote: '5' },
  { id: 'p2', name: 'David', vote: '8' },
];

describe('useParticipantsVm', () => {
  it('should return the provided participants', () => {
    // Arrange & Act
    const { result } = renderHook(() => useParticipantsVm(SOURCE));

    // Assert
    expect(result.current.participants).toEqual(SOURCE);
  });

  it('should fall back to the mock participants by default', () => {
    // Arrange & Act
    const { result } = renderHook(() => useParticipantsVm());

    // Assert
    expect(result.current.participants.length).toBeGreaterThan(0);
  });

  it('should clear every vote when resetting', () => {
    // Arrange
    const { result } = renderHook(() => useParticipantsVm(SOURCE));

    // Act
    act(() => result.current.resetVotes());

    // Assert
    expect(result.current.participants.every((participant) => !hasVoted(participant))).toBe(true);
  });
});
