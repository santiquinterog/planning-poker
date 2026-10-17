import type { GameRepository } from '@/contexts/game/adapters/game-repository';
import type { Game } from '@/contexts/game/domain/game';
import { validateGameName } from '@/contexts/game/domain/game-name-validation';

export class InvalidGameNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidGameNameError';
  }
}

export interface GameService {
  createGame(name: string): Game;
  getGameById(gameId: string): Game | null;
}

interface GameServiceDependencies {
  repository: GameRepository;
  generateId: () => string;
  now: () => Date;
}

export function createGameService({
  repository,
  generateId,
  now,
}: GameServiceDependencies): GameService {
  return {
    createGame(name) {
      const validation = validateGameName(name);
      if (!validation.isValid) {
        throw new InvalidGameNameError(validation.error);
      }
      const game: Game = {
        id: generateId(),
        name: validation.value,
        createdAt: now().toISOString(),
      };
      repository.save(game);
      return game;
    },
    getGameById(gameId) {
      return repository.findById(gameId);
    },
  };
}
