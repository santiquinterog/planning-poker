import { describe, expect, it, vi } from 'vitest';
import type { GameRepository } from '@/contexts/game/adapters/game-repository';
import { createGameService, InvalidGameNameError } from '@/contexts/game/services/game-service';

function setup() {
  const repository: GameRepository = { save: vi.fn(), findById: vi.fn() };
  const service = createGameService({
    repository,
    generateId: () => 'game-1',
    now: () => new Date('2026-10-16T10:00:00.000Z'),
  });
  return { repository, service };
}

describe('createGameService', () => {
  it('should save and return a new game with the trimmed name', () => {
    // Arrange
    const { repository, service } = setup();

    // Act
    const game = service.createGame('  Sprint 32 ');

    // Assert
    const expected = { id: 'game-1', name: 'Sprint 32', createdAt: '2026-10-16T10:00:00.000Z' };
    expect(game).toEqual(expected);
    expect(repository.save).toHaveBeenCalledWith(expected);
  });

  it('should throw InvalidGameNameError and not save when the name is invalid', () => {
    // Arrange
    const { repository, service } = setup();

    // Act
    const act = () => service.createGame('Sprint_32');

    // Assert
    expect(act).toThrow(InvalidGameNameError);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
