import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useParticipantsVm } from '@/contexts/game/hooks/useParticipantsVm';
import type { Participant } from '@/contexts/game/domain/participant';

describe('useParticipantsVm', () => {
  it('should return the provided participants', () => {
    // Arrange
    const source: Participant[] = [{ id: 'p1', name: 'Oscar', vote: '5' }];

    // Act
    const { result } = renderHook(() => useParticipantsVm(source));

    // Assert
    expect(result.current.participants).toEqual(source);
  });

  it('should fall back to the mock participants by default', () => {
    // Arrange & Act
    const { result } = renderHook(() => useParticipantsVm());

    // Assert
    expect(result.current.participants.length).toBeGreaterThan(0);
  });
});
