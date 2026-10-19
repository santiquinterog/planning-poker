import { useCallback, useState } from 'react';
import { MOCK_PARTICIPANTS } from '@/contexts/game/adapters/mock-participants';
import { clearVotes } from '@/contexts/game/domain/participant';
import type { Participant } from '@/contexts/game/domain/participant';

interface ParticipantsVm {
  participants: readonly Participant[];
  resetVotes: () => void;
}

// Lista de participantes en la mesa. Hoy parte de un mock; mañana vendría de un repositorio real.
export function useParticipantsVm(
  initial: readonly Participant[] = MOCK_PARTICIPANTS,
): ParticipantsVm {
  const [participants, setParticipants] = useState<readonly Participant[]>(initial);

  const resetVotes = useCallback(() => {
    setParticipants((current) => clearVotes(current));
  }, []);

  return { participants, resetVotes };
}
