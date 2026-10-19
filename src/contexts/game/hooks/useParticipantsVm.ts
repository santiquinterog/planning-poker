import { useMemo } from 'react';
import { MOCK_PARTICIPANTS } from '@/contexts/game/adapters/mock-participants';
import type { Participant } from '@/contexts/game/domain/participant';

// Lista de participantes en la mesa. Hoy es un mock; mañana vendría de un repositorio real.
export function useParticipantsVm(source: readonly Participant[] = MOCK_PARTICIPANTS): {
  participants: readonly Participant[];
} {
  const participants = useMemo(() => source, [source]);
  return { participants };
}
