import type { Game } from '@/contexts/game/domain/game';

export interface GameRepository {
  save(game: Game): void;
  findById(gameId: string): Game | null;
}
