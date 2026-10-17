import { gameSchema, type Game } from '@/contexts/game/domain/game';
import type { GameRepository } from '@/contexts/game/adapters/game-repository';

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

const KEY_PREFIX = 'planning-poker:game:';

export class SessionStorageGameRepository implements GameRepository {
  private readonly storage: KeyValueStorage;

  constructor(storage: KeyValueStorage) {
    this.storage = storage;
  }

  save(game: Game): void {
    this.storage.setItem(this.keyFor(game.id), JSON.stringify(game));
  }

  findById(gameId: string): Game | null {
    const raw = this.storage.getItem(this.keyFor(gameId));
    if (raw === null) {
      return null;
    }
    return this.parseGame(raw);
  }

  private keyFor(gameId: string): string {
    return `${KEY_PREFIX}${gameId}`;
  }

  private parseGame(raw: string): Game | null {
    try {
      const result = gameSchema.safeParse(JSON.parse(raw));
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  }
}
