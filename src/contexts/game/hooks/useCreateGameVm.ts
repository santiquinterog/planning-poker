import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { getVisibleNameError } from '@/contexts/game/create-game-helpers';
import { validateGameName } from '@/contexts/game/domain/game-name-validation';
import type { GameService } from '@/contexts/game/services/game-service';
import { gameService } from '@/contexts/game/services/game-service-instance';
import { ROUTES } from '@/config/routes';

export const CREATE_GAME_ERROR = 'No pudimos crear la partida. Intenta de nuevo.';

export function useCreateGameVm(service: Pick<GameService, 'createGame'> = gameService) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validation = useMemo(() => validateGameName(name), [name]);
  const nameError = getVisibleNameError(validation, isTouched);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    setSubmitError(null);
  }, []);

  const handleNameBlur = useCallback(() => setIsTouched(true), []);

  const handleSubmit = useCallback(() => {
    setIsTouched(true);
    if (!validation.isValid) {
      return;
    }
    try {
      const game = service.createGame(validation.value);
      navigate(ROUTES.game(game.id));
    } catch {
      setSubmitError(CREATE_GAME_ERROR);
    }
  }, [validation, service, navigate]);

  return {
    name,
    nameError,
    submitError,
    canSubmit: validation.isValid,
    handleNameChange,
    handleNameBlur,
    handleSubmit,
  };
}
