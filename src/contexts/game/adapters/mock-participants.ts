import type { Participant } from '@/contexts/game/domain/participant';

// Mock de jugadores en la mesa mientras no hay backend.
// Todos tienen voto para poder probar el flujo de revelar (frames 60:1035 y 60:1346).
export const MOCK_PARTICIPANTS: readonly Participant[] = [
  { id: 'p-oscar', name: 'Oscar', vote: '5' },
  { id: 'p-david', name: 'David', vote: '21' },
  { id: 'p-albert', name: 'Albert', vote: '13' },
  { id: 'p-pedro', name: 'Pedro', vote: '13' },
  { id: 'p-nata', name: 'Nata', vote: '13' },
  { id: 'p-carlos', name: 'Carlos', vote: '21' },
  { id: 'p-vale', name: 'Vale', vote: '5' },
];
