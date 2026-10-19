import type { Participant } from '@/contexts/game/domain/participant';

// Mock de jugadores en la mesa mientras no hay backend (frames 60:874 y 60:994).
// Unos ya votaron (vote con valor) y otros no (vote null). El número se revela en otra HU.
export const MOCK_PARTICIPANTS: readonly Participant[] = [
  { id: 'p-oscar', name: 'Oscar', vote: '5' },
  { id: 'p-david', name: 'David', vote: null },
  { id: 'p-albert', name: 'Albert', vote: '8' },
  { id: 'p-pedro', name: 'Pedro', vote: null },
  { id: 'p-nata', name: 'Nata', vote: '3' },
  { id: 'p-carlos', name: 'Carlos', vote: '13' },
  { id: 'p-vale', name: 'Vale', vote: null },
];
