import type { User } from '@/contexts/user/domain/user';

export interface UserRepository {
  save(user: User): void;
  findByGameSlug(gameSlug: string): User | null;
}
