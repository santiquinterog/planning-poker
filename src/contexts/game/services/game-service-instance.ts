import { SessionStorageGameRepository } from '@/contexts/game/adapters/session-storage-game-repository';
import { createGameService } from '@/contexts/game/services/game-service';

// Composition root del contexto: el único lugar que conoce la implementación concreta del storage.
export const gameService = createGameService({
  repository: new SessionStorageGameRepository(window.sessionStorage),
  generateId: () => crypto.randomUUID(),
  now: () => new Date(),
});
