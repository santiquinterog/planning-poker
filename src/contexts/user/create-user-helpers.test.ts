import { describe, expect, it } from 'vitest';
import { getVisibleUserNameError } from '@/contexts/user/create-user-helpers';
import { USER_NAME_ERRORS } from '@/contexts/user/domain/user-name-validation';

describe('getVisibleUserNameError', () => {
  it('should return null when the name is valid', () => {
    // Arrange & Act
    const error = getVisibleUserNameError({ isValid: true, value: 'Luisa' }, true);

    // Assert
    expect(error).toBeNull();
  });

  it.each([USER_NAME_ERRORS.required, USER_NAME_ERRORS.tooShort])(
    'should hide "%s" until the field is touched',
    (message) => {
      // Arrange & Act
      const error = getVisibleUserNameError({ isValid: false, error: message }, false);

      // Assert
      expect(error).toBeNull();
    },
  );

  it('should show a progressive error once the field is touched', () => {
    // Arrange & Act
    const error = getVisibleUserNameError(
      { isValid: false, error: USER_NAME_ERRORS.tooShort },
      true,
    );

    // Assert
    expect(error).toBe(USER_NAME_ERRORS.tooShort);
  });

  it('should show a non-progressive error immediately', () => {
    // Arrange & Act
    const error = getVisibleUserNameError(
      { isValid: false, error: USER_NAME_ERRORS.invalidCharacters },
      false,
    );

    // Assert
    expect(error).toBe(USER_NAME_ERRORS.invalidCharacters);
  });
});
