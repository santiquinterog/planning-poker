import { userSchema, type User } from '@/contexts/user/domain/user';
import type { UserRepository } from '@/contexts/user/adapters/user-repository';

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

const KEY_PREFIX = 'planning-poker:admin:';

export class SessionStorageUserRepository implements UserRepository {
  private readonly storage: KeyValueStorage;

  constructor(storage: KeyValueStorage) {
    this.storage = storage;
  }

  save(user: User): void {
    this.storage.setItem(this.keyFor(user.gameSlug), JSON.stringify(user));
  }

  findByGameSlug(gameSlug: string): User | null {
    const raw = this.storage.getItem(this.keyFor(gameSlug));
    if (raw === null) {
      return null;
    }
    return this.parseUser(raw);
  }

  private keyFor(gameSlug: string): string {
    return `${KEY_PREFIX}${gameSlug}`;
  }

  private parseUser(raw: string): User | null {
    try {
      const result = userSchema.safeParse(JSON.parse(raw));
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  }
}
