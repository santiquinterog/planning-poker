import {
  validateDisplayName,
  type DisplayNameValidation,
} from '@/contexts/shared-validation/display-name-validation';

export const USER_NAME_ERRORS = {
  required: 'Tu nombre es obligatorio',
  invalidCharacters: 'Solo se permiten letras, números y espacios',
  tooShort: 'El nombre debe tener al menos 5 caracteres',
  tooLong: 'El nombre debe tener máximo 20 caracteres',
  onlyDigits: 'El nombre no puede contener solo números',
  tooManyDigits: 'El nombre puede tener máximo 3 números',
} as const;

export type UserNameValidation = DisplayNameValidation;

export function validateUserName(input: string): UserNameValidation {
  return validateDisplayName(input, USER_NAME_ERRORS);
}
