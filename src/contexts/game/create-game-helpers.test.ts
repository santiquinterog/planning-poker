import { describe, expect, it } from 'vitest';
import { getVisibleNameError } from '@/contexts/game/create-game-helpers';
import { GAME_NAME_ERRORS } from '@/contexts/game/domain/game-name-validation';

describe('getVisibleNameError', () => {
  it('should return null when the name is valid', () => {
    // Arrange
    const validation = { isValid: true as const, value: 'Sprint 32' };

    // Act
    const error = getVisibleNameError(validation, true);

    // Assert
    expect(error).toBeNull();
  });

  it.each([GAME_NAME_ERRORS.required, GAME_NAME_ERRORS.tooShort])(
    'should hide "%s" while the field has not been touched',
    (message) => {
      // Arrange
      const validation = { isValid: false as const, error: message };

      // Act
      const error = getVisibleNameError(validation, false);

      // Assert
      expect(error).toBeNull();
    },
  );

  it('should show a progressive error once the field has been touched', () => {
    // Arrange
    const validation = { isValid: false as const, error: GAME_NAME_ERRORS.tooShort };

    // Act
    const error = getVisibleNameError(validation, true);

    // Assert
    expect(error).toBe(GAME_NAME_ERRORS.tooShort);
  });

  it('should show a non-progressive error immediately even if the field was not touched', () => {
    // Arrange
    const validation = { isValid: false as const, error: GAME_NAME_ERRORS.invalidCharacters };

    // Act
    const error = getVisibleNameError(validation, false);

    // Assert
    expect(error).toBe(GAME_NAME_ERRORS.invalidCharacters);
  });
});
