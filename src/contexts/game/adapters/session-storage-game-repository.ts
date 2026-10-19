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
    this.storage.setItem(this.keyFor(game.slug), JSON.stringify(game));
  }

  findBySlug(slug: string): Game | null {
    const raw = this.storage.getItem(this.keyFor(slug));
    if (raw === null) {
      return null;
    }
    return this.parseGame(raw);
  }

  private keyFor(slug: string): string {
    return `${KEY_PREFIX}${slug}`;
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
