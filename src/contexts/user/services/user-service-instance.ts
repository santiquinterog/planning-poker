import { SessionStorageUserRepository } from '@/contexts/user/adapters/session-storage-user-repository';
import { createUserService } from '@/contexts/user/services/user-service';

// Composition root del contexto user: único lugar que conoce el storage concreto.
export const userService = createUserService({
  repository: new SessionStorageUserRepository(window.sessionStorage),
  generateId: () => crypto.randomUUID(),
  now: () => new Date(),
});
