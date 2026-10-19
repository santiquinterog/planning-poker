import type { UserNameValidation } from '@/contexts/user/domain/user-name-validation';
import { USER_NAME_ERRORS } from '@/contexts/user/domain/user-name-validation';

// Errores que surgen naturalmente al escribir: solo se muestran tras salir del campo.
const PROGRESSIVE_ERRORS: ReadonlySet<string> = new Set([
  USER_NAME_ERRORS.required,
  USER_NAME_ERRORS.tooShort,
]);

export function getVisibleUserNameError(
  validation: UserNameValidation,
  isTouched: boolean,
): string | null {
  if (validation.isValid) {
    return null;
  }
  if (isTouched || !PROGRESSIVE_ERRORS.has(validation.error)) {
    return validation.error;
  }
  return null;
}
