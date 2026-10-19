import { describe, expect, it } from 'vitest';
import { buildGameLink } from '@/contexts/game/domain/game-link';

describe('buildGameLink', () => {
  it('should build an absolute link from the origin and the slug', () => {
    // Arrange & Act
    const link = buildGameLink('http://localhost:5173', 'sprint-32');

    // Assert
    expect(link).toBe('http://localhost:5173/partida/sprint-32');
  });
});
