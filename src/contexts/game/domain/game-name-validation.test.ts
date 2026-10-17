import { describe, expect, it } from 'vitest';
import { GAME_NAME_ERRORS, validateGameName } from '@/contexts/game/domain/game-name-validation';

describe('validateGameName', () => {
  it.each(['Sprint 32', 'Revisión año', 'Equipo Ñandú 123', 'Abcde', 'Nombre de veinte car'])(
    'should accept "%s" as a valid name',
    (input) => {
      // Arrange & Act
      const result = validateGameName(input);

      // Assert
      expect(result).toEqual({ isValid: true, value: input });
    },
  );

  it('should return the trimmed name when it has surrounding spaces', () => {
    // Arrange
    const input = '  Sprint 32  ';

    // Act
    const result = validateGameName(input);

    // Assert
    expect(result).toEqual({ isValid: true, value: 'Sprint 32' });
  });

  it.each([
    ['', GAME_NAME_ERRORS.required],
    ['   ', GAME_NAME_ERRORS.required],
    ['Abcd', GAME_NAME_ERRORS.tooShort],
    ['  Abc  ', GAME_NAME_ERRORS.tooShort],
    ['Nombre de veinte cara', GAME_NAME_ERRORS.tooLong],
    ['12345', GAME_NAME_ERRORS.onlyDigits],
    ['1 2 3', GAME_NAME_ERRORS.onlyDigits],
    ['Sprint 1234', GAME_NAME_ERRORS.tooManyDigits],
  ])('should reject "%s" with the message "%s"', (input, expectedError) => {
    // Arrange & Act
    const result = validateGameName(input);

    // Assert
    expect(result).toEqual({ isValid: false, error: expectedError });
  });

  it.each([
    'Sprint_32',
    'Sprint,32',
    'Sprint.32',
    'Sprint*32',
    'Sprint#32',
    'Sprint/32',
    'Sprint-32',
    'Sprint@32',
    'Sprint 🚀',
  ])('should reject special characters in "%s"', (input) => {
    // Arrange & Act
    const result = validateGameName(input);

    // Assert
    expect(result).toEqual({ isValid: false, error: GAME_NAME_ERRORS.invalidCharacters });
  });
});
