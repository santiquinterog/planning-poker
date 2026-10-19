import { describe, expect, it } from 'vitest';
import { toGameSlug } from '@/contexts/game/domain/game-slug';

describe('toGameSlug', () => {
  it.each([
    ['Sprint 32', 'sprint-32'],
    ['Revisión año', 'revision-ano'],
    ['Equipo Ñandú', 'equipo-nandu'],
    ['  Doble  espacio  ', 'doble-espacio'],
    ['MAYUS', 'mayus'],
  ])('should turn "%s" into "%s"', (input, expected) => {
    // Arrange & Act
    const slug = toGameSlug(input);

    // Assert
    expect(slug).toBe(expected);
  });
});
