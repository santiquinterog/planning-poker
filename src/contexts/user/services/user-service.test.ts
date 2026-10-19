import { describe, expect, it, vi } from 'vitest';
import type { UserRepository } from '@/contexts/user/adapters/user-repository';
import { createUserService, InvalidUserNameError } from '@/contexts/user/services/user-service';

function setup() {
  const repository: UserRepository = { save: vi.fn(), findByGameSlug: vi.fn() };
  const service = createUserService({
    repository,
    generateId: () => 'user-1',
    now: () => new Date('2026-10-16T10:00:00.000Z'),
  });
  return { repository, service };
}

describe('createUserService', () => {
  it('should create a user with the trimmed name and the chosen role', () => {
    // Arrange
    const { repository, service } = setup();

    // Act
    const user = service.createUser({ gameSlug: 'sprint-32', name: '  Luisa ', role: 'spectator' });

    // Assert
    const expected = {
      id: 'user-1',
      gameSlug: 'sprint-32',
      name: 'Luisa',
      role: 'spectator',
      createdAt: '2026-10-16T10:00:00.000Z',
    };
    expect(user).toEqual(expected);
    expect(repository.save).toHaveBeenCalledWith(expected);
  });

  it('should throw InvalidUserNameError and not save when the name is invalid', () => {
    // Arrange
    const { repository, service } = setup();

    // Act
    const act = () => service.createUser({ gameSlug: 'sprint-32', name: 'Lu', role: 'player' });

    // Assert
    expect(act).toThrow(InvalidUserNameError);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
