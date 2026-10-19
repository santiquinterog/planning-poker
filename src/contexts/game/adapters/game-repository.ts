import type { Game } from '@/contexts/game/domain/game';

export interface GameRepository {
  save(game: Game): void;
  findBySlug(slug: string): Game | null;
}
