import {
  DISPLAY_NAME_MAX_DIGITS,
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  createDisplayNameSchema,
  validateDisplayName,
  type DisplayNameValidation,
} from '@/contexts/shared-validation/display-name-validation';

export const GAME_NAME_MIN_LENGTH = DISPLAY_NAME_MIN_LENGTH;
export const GAME_NAME_MAX_LENGTH = DISPLAY_NAME_MAX_LENGTH;
export const GAME_NAME_MAX_DIGITS = DISPLAY_NAME_MAX_DIGITS;

export const GAME_NAME_ERRORS = {
  required: 'El nombre de la partida es obligatorio',
  invalidCharacters: 'Solo se permiten letras, números y espacios',
  tooShort: `El nombre debe tener al menos ${GAME_NAME_MIN_LENGTH} caracteres`,
  tooLong: `El nombre debe tener máximo ${GAME_NAME_MAX_LENGTH} caracteres`,
  onlyDigits: 'El nombre no puede contener solo números',
  tooManyDigits: `El nombre puede tener máximo ${GAME_NAME_MAX_DIGITS} números`,
} as const;

export type GameNameValidation = DisplayNameValidation;

export const gameNameSchema = createDisplayNameSchema(GAME_NAME_ERRORS);

export function validateGameName(input: string): GameNameValidation {
  return validateDisplayName(input, GAME_NAME_ERRORS);
}
