import { describe, expect, it } from 'vitest';
import { USER_NAME_ERRORS, validateUserName } from '@/contexts/user/domain/user-name-validation';

describe('validateUserName', () => {
  it('should accept a valid name and return the trimmed value', () => {
    // Arrange & Act
    const result = validateUserName('  Luisa ');

    // Assert
    expect(result).toEqual({ isValid: true, value: 'Luisa' });
  });

  it('should use the user-specific required message', () => {
    // Arrange & Act
    const result = validateUserName('');

    // Assert
    expect(result).toEqual({ isValid: false, error: USER_NAME_ERRORS.required });
  });

  it.each([
    ['Ab', USER_NAME_ERRORS.tooShort],
    ['12345', USER_NAME_ERRORS.onlyDigits],
    ['Luisa 1234', USER_NAME_ERRORS.tooManyDigits],
    ['Luisa_P', USER_NAME_ERRORS.invalidCharacters],
  ])('should reject "%s" with the matching message', (input, expected) => {
    // Arrange & Act
    const result = validateUserName(input);

    // Assert
    expect(result).toEqual({ isValid: false, error: expected });
  });
});
