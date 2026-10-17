import {
  GAME_NAME_ERRORS,
  type GameNameValidation,
} from '@/contexts/game/domain/game-name-validation';

// Errores que aparecen naturalmente mientras se escribe: solo se muestran tras salir del campo.
const PROGRESSIVE_ERRORS: ReadonlySet<string> = new Set([
  GAME_NAME_ERRORS.required,
  GAME_NAME_ERRORS.tooShort,
]);

export function getVisibleNameError(
  validation: GameNameValidation,
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
