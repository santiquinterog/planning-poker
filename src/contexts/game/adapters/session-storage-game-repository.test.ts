import { describe, expect, it, vi } from 'vitest';
import { SessionStorageGameRepository } from '@/contexts/game/adapters/session-storage-game-repository';
import type { Game } from '@/contexts/game/domain/game';

const GAME: Game = { slug: 'sprint-32', name: 'Sprint 32', createdAt: '2026-10-16T10:00:00.000Z' };

function createStorageMock(initial: Record<string, string> = {}) {
  const entries = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((key: string) => entries.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      entries.set(key, value);
    }),
  };
}

describe('SessionStorageGameRepository', () => {
  it('should return the saved game when looking it up by slug', () => {
    // Arrange
    const repository = new SessionStorageGameRepository(createStorageMock());

    // Act
    repository.save(GAME);
    const found = repository.findBySlug(GAME.slug);

    // Assert
    expect(found).toEqual(GAME);
  });

  it('should return null when the game does not exist', () => {
    // Arrange
    const repository = new SessionStorageGameRepository(createStorageMock());

    // Act
    const found = repository.findBySlug('missing');

    // Assert
    expect(found).toBeNull();
  });

  it.each(['not-json', JSON.stringify({ slug: 'sprint-32' })])(
    'should return null when the stored data is corrupt (%s)',
    (raw) => {
      // Arrange
      const storage = createStorageMock({ 'planning-poker:game:sprint-32': raw });
      const repository = new SessionStorageGameRepository(storage);

      // Act
      const found = repository.findBySlug('sprint-32');

      // Assert
      expect(found).toBeNull();
    },
  );
});
