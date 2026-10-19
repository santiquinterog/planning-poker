import type { GameRepository } from '@/contexts/game/adapters/game-repository';
import type { Game } from '@/contexts/game/domain/game';
import { validateGameName } from '@/contexts/game/domain/game-name-validation';
import { toGameSlug } from '@/contexts/game/domain/game-slug';

export class InvalidGameNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidGameNameError';
  }
}

export interface GameService {
  createGame(name: string): Game;
  getGameBySlug(slug: string): Game | null;
}

interface GameServiceDependencies {
  repository: GameRepository;
  now: () => Date;
}

export function createGameService({ repository, now }: GameServiceDependencies): GameService {
  return {
    createGame(name) {
      const validation = validateGameName(name);
      if (!validation.isValid) {
        throw new InvalidGameNameError(validation.error);
      }
      // El slug reemplaza cualquier partida previa con el mismo nombre (sin control de colisiones).
      const game: Game = {
        slug: toGameSlug(validation.value),
        name: validation.value,
        createdAt: now().toISOString(),
      };
      repository.save(game);
      return game;
    },
    getGameBySlug(slug) {
      return repository.findBySlug(slug);
    },
  };
}
