import { z } from 'zod';

export const GAME_NAME_MIN_LENGTH = 5;
export const GAME_NAME_MAX_LENGTH = 20;
export const GAME_NAME_MAX_DIGITS = 3;

export const GAME_NAME_ERRORS = {
  required: 'El nombre de la partida es obligatorio',
  invalidCharacters: 'Solo se permiten letras, números y espacios',
  tooShort: `El nombre debe tener al menos ${GAME_NAME_MIN_LENGTH} caracteres`,
  tooLong: `El nombre debe tener máximo ${GAME_NAME_MAX_LENGTH} caracteres`,
  onlyDigits: 'El nombre no puede contener solo números',
  tooManyDigits: `El nombre puede tener máximo ${GAME_NAME_MAX_DIGITS} números`,
} as const;

const ALLOWED_CHARACTERS = /^[\p{L}\p{M}0-9 ]+$/u;
const LETTER = /\p{L}/u;
const DIGIT = /[0-9]/g;

const countDigits = (value: string) => value.match(DIGIT)?.length ?? 0;

export const gameNameSchema = z
  .string()
  .trim()
  .min(1, GAME_NAME_ERRORS.required)
  .regex(ALLOWED_CHARACTERS, GAME_NAME_ERRORS.invalidCharacters)
  .min(GAME_NAME_MIN_LENGTH, GAME_NAME_ERRORS.tooShort)
  .max(GAME_NAME_MAX_LENGTH, GAME_NAME_ERRORS.tooLong)
  .refine((value) => LETTER.test(value), GAME_NAME_ERRORS.onlyDigits)
  .refine((value) => countDigits(value) <= GAME_NAME_MAX_DIGITS, GAME_NAME_ERRORS.tooManyDigits);

export type GameNameValidation =
  { isValid: true; value: string } | { isValid: false; error: string };

export function validateGameName(input: string): GameNameValidation {
  const result = gameNameSchema.safeParse(input);
  if (result.success) {
    return { isValid: true, value: result.data };
  }
  return { isValid: false, error: result.error.issues[0]?.message ?? GAME_NAME_ERRORS.required };
}
