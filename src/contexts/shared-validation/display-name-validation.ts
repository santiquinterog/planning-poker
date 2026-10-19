import { z } from 'zod';

export const DISPLAY_NAME_MIN_LENGTH = 5;
export const DISPLAY_NAME_MAX_LENGTH = 20;
export const DISPLAY_NAME_MAX_DIGITS = 3;

export interface DisplayNameErrorMessages {
  required: string;
  invalidCharacters: string;
  tooShort: string;
  tooLong: string;
  onlyDigits: string;
  tooManyDigits: string;
}

export type DisplayNameValidation =
  { isValid: true; value: string } | { isValid: false; error: string };

const ALLOWED_CHARACTERS = /^[\p{L}\p{M}0-9 ]+$/u;
const LETTER = /\p{L}/u;
const DIGIT = /[0-9]/g;

const countDigits = (value: string) => value.match(DIGIT)?.length ?? 0;

export function createDisplayNameSchema(messages: DisplayNameErrorMessages) {
  return z
    .string()
    .trim()
    .min(1, messages.required)
    .regex(ALLOWED_CHARACTERS, messages.invalidCharacters)
    .min(DISPLAY_NAME_MIN_LENGTH, messages.tooShort)
    .max(DISPLAY_NAME_MAX_LENGTH, messages.tooLong)
    .refine((value) => LETTER.test(value), messages.onlyDigits)
    .refine((value) => countDigits(value) <= DISPLAY_NAME_MAX_DIGITS, messages.tooManyDigits);
}

export function validateDisplayName(
  input: string,
  messages: DisplayNameErrorMessages,
): DisplayNameValidation {
  const result = createDisplayNameSchema(messages).safeParse(input);
  if (result.success) {
    return { isValid: true, value: result.data };
  }
  return { isValid: false, error: result.error.issues[0]?.message ?? messages.required };
}
