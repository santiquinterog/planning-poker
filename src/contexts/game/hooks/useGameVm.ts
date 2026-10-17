import { useMemo } from 'react';
import type { GameService } from '@/contexts/game/services/game-service';
import { gameService } from '@/contexts/game/services/game-service-instance';

export function useGameVm(
  gameId: string | undefined,
  service: Pick<GameService, 'getGameById'> = gameService,
) {
  const game = useMemo(() => (gameId ? service.getGameById(gameId) : null), [gameId, service]);
  return { game };
}
