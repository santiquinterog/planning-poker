import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COPY_DONE_LABEL, COPY_IDLE_LABEL, useInviteVm } from '@/contexts/game/hooks/useInviteVm';

describe('useInviteVm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup(writeText = vi.fn().mockResolvedValue(undefined)) {
    const view = renderHook(() =>
      useInviteVm('sprint-32', { origin: 'http://localhost:5173', clipboard: { writeText } }),
    );
    return { ...view, writeText };
  }

  it('should expose the absolute game link', () => {
    // Arrange & Act
    const { result } = setup();

    // Assert
    expect(result.current.link).toBe('http://localhost:5173/partida/sprint-32');
    expect(result.current.copyLabel).toBe(COPY_IDLE_LABEL);
  });

  it('should copy the link and show feedback that resets after a delay', async () => {
    // Arrange
    const { result, writeText } = setup();

    // Act
    await act(async () => {
      await result.current.copyLink();
    });

    // Assert
    expect(writeText).toHaveBeenCalledWith('http://localhost:5173/partida/sprint-32');
    expect(result.current.copyLabel).toBe(COPY_DONE_LABEL);

    // Act
    act(() => vi.advanceTimersByTime(2000));

    // Assert
    expect(result.current.copyLabel).toBe(COPY_IDLE_LABEL);
  });

  it('should keep the idle label when copying fails', async () => {
    // Arrange
    const writeText = vi.fn().mockRejectedValue(new Error('no clipboard'));
    const { result } = setup(writeText);

    // Act
    await act(async () => {
      await result.current.copyLink();
    });

    // Assert
    expect(result.current.copyLabel).toBe(COPY_IDLE_LABEL);
  });
});
