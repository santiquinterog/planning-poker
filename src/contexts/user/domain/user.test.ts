import { describe, expect, it } from 'vitest';
import { canInteractWithCards } from '@/contexts/user/domain/user';

describe('canInteractWithCards', () => {
  it('should allow a player to interact with the cards', () => {
    // Arrange & Act & Assert
    expect(canInteractWithCards('player')).toBe(true);
  });

  it('should not allow a spectator to interact with the cards', () => {
    // Arrange & Act & Assert
    expect(canInteractWithCards('spectator')).toBe(false);
  });
});
