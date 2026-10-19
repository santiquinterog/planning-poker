import { describe, expect, it } from 'vitest';
import {
  validateDisplayName,
  type DisplayNameErrorMessages,
} from '@/contexts/shared-validation/display-name-validation';

const MESSAGES: DisplayNameErrorMessages = {
  required: 'required',
  invalidCharacters: 'invalidCharacters',
  tooShort: 'tooShort',
  tooLong: 'tooLong',
  onlyDigits: 'onlyDigits',
  tooManyDigits: 'tooManyDigits',
};

describe('validateDisplayName', () => {
  it.each(['Sprint 32', 'Revisión año', 'Equipo Ñandú 123', 'Abcde'])(
    'should accept "%s" and return the trimmed value',
    (input) => {
      // Arrange & Act
      const result = validateDisplayName(input, MESSAGES);

      // Assert
      expect(result).toEqual({ isValid: true, value: input });
    },
  );

  it('should trim surrounding spaces from the accepted value', () => {
    // Arrange & Act
    const result = validateDisplayName('  Sprint 32  ', MESSAGES);

    // Assert
    expect(result).toEqual({ isValid: true, value: 'Sprint 32' });
  });

  it.each([
    ['', 'required'],
    ['   ', 'required'],
    ['Abcd', 'tooShort'],
    ['Nombre de veinte cara', 'tooLong'],
    ['12345', 'onlyDigits'],
    ['Sprint 1234', 'tooManyDigits'],
    ['Sprint_32', 'invalidCharacters'],
    ['Sprint 🚀', 'invalidCharacters'],
  ])('should reject "%s" with the "%s" message', (input, expected) => {
    // Arrange & Act
    const result = validateDisplayName(input, MESSAGES);

    // Assert
    expect(result).toEqual({ isValid: false, error: expected });
  });
});
