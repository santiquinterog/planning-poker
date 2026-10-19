import { useMemo } from 'react';
import type { GameService } from '@/contexts/game/services/game-service';
import { gameService } from '@/contexts/game/services/game-service-instance';

export function useGameVm(
  slug: string | undefined,
  service: Pick<GameService, 'getGameBySlug'> = gameService,
) {
  const game = useMemo(() => (slug ? service.getGameBySlug(slug) : null), [slug, service]);
  return { game };
}
