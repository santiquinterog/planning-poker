import type { UserRepository } from '@/contexts/user/adapters/user-repository';
import type { User, UserRole } from '@/contexts/user/domain/user';
import { validateUserName } from '@/contexts/user/domain/user-name-validation';

export class InvalidUserNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUserNameError';
  }
}

export interface CreateUserInput {
  gameSlug: string;
  name: string;
  role: UserRole;
}

export interface UserService {
  createUser(input: CreateUserInput): User;
  getUserByGameSlug(gameSlug: string): User | null;
}

interface UserServiceDependencies {
  repository: UserRepository;
  generateId: () => string;
  now: () => Date;
}

export function createUserService({
  repository,
  generateId,
  now,
}: UserServiceDependencies): UserService {
  return {
    createUser({ gameSlug, name, role }) {
      const validation = validateUserName(name);
      if (!validation.isValid) {
        throw new InvalidUserNameError(validation.error);
      }
      const user: User = {
        id: generateId(),
        gameSlug,
        name: validation.value,
        role,
        createdAt: now().toISOString(),
      };
      repository.save(user);
      return user;
    },
    getUserByGameSlug(gameSlug) {
      return repository.findByGameSlug(gameSlug);
    },
  };
}
