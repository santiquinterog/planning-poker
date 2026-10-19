import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRoundVm } from '@/contexts/game/hooks/useRoundVm';
import type { Participant } from '@/contexts/game/domain/participant';

const ALL_VOTED: Participant[] = [
  { id: '1', name: 'Oscar', vote: '3' },
  { id: '2', name: 'David', vote: '5' },
];
const SOME_PENDING: Participant[] = [
  { id: '1', name: 'Oscar', vote: '3' },
  { id: '2', name: 'David', vote: null },
];

describe('useRoundVm', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('should start in the voting phase', () => {
    const { result } = renderHook(() => useRoundVm(ALL_VOTED));
    expect(result.current.phase).toBe('voting');
    expect(result.current.results).toBeNull();
  });

  it('should allow reveal only when everyone voted', () => {
    expect(renderHook(() => useRoundVm(ALL_VOTED)).result.current.canReveal).toBe(true);
    expect(renderHook(() => useRoundVm(SOME_PENDING)).result.current.canReveal).toBe(false);
  });

  it('should go through counting and then reveal the results', () => {
    // Arrange
    const { result } = renderHook(() => useRoundVm(ALL_VOTED, 1500));

    // Act
    act(() => result.current.reveal());

    // Assert
    expect(result.current.phase).toBe('counting');

    // Act
    act(() => vi.advanceTimersByTime(1500));

    // Assert
    expect(result.current.phase).toBe('revealed');
    expect(result.current.results?.tallies.length).toBeGreaterThan(0);
  });

  it('should ignore reveal when not everyone voted', () => {
    // Arrange
    const { result } = renderHook(() => useRoundVm(SOME_PENDING));

    // Act
    act(() => result.current.reveal());

    // Assert
    expect(result.current.phase).toBe('voting');
  });

  it('should reset back to the voting phase', () => {
    // Arrange
    const { result } = renderHook(() => useRoundVm(ALL_VOTED, 1500));
    act(() => result.current.reveal());
    act(() => vi.advanceTimersByTime(1500));

    // Act
    act(() => result.current.reset());

    // Assert
    expect(result.current.phase).toBe('voting');
    expect(result.current.results).toBeNull();
  });
});
