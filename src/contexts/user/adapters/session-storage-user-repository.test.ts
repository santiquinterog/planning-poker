import { describe, expect, it, vi } from 'vitest';
import { SessionStorageUserRepository } from '@/contexts/user/adapters/session-storage-user-repository';
import type { User } from '@/contexts/user/domain/user';

const USER: User = {
  id: 'user-1',
  gameSlug: 'sprint-32',
  name: 'Luisa',
  role: 'spectator',
  createdAt: '2026-10-16T10:00:00.000Z',
};

function createStorageMock(initial: Record<string, string> = {}) {
  const entries = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((key: string) => entries.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      entries.set(key, value);
    }),
  };
}

describe('SessionStorageUserRepository', () => {
  it('should return the saved user when looking it up by game slug', () => {
    // Arrange
    const repository = new SessionStorageUserRepository(createStorageMock());

    // Act
    repository.save(USER);
    const found = repository.findByGameSlug('sprint-32');

    // Assert
    expect(found).toEqual(USER);
  });

  it('should return null when no user exists for the game', () => {
    // Arrange
    const repository = new SessionStorageUserRepository(createStorageMock());

    // Act
    const found = repository.findByGameSlug('missing');

    // Assert
    expect(found).toBeNull();
  });

  it('should return null when the stored data is corrupt', () => {
    // Arrange
    const storage = createStorageMock({ 'planning-poker:admin:sprint-32': '{bad json' });
    const repository = new SessionStorageUserRepository(storage);

    // Act
    const found = repository.findByGameSlug('sprint-32');

    // Assert
    expect(found).toBeNull();
  });
});
