import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Participant } from '@/contexts/game/domain/participant';
import type { RoundPhase } from '@/contexts/game/domain/round';
import {
  allVoted,
  computeVoteResults,
  type VoteResults,
} from '@/contexts/game/domain/vote-results';

export const COUNTING_DURATION_MS = 1500;

interface RoundVm {
  phase: RoundPhase;
  canReveal: boolean;
  results: VoteResults | null;
  reveal: () => void;
  reset: () => void;
}

export function useRoundVm(
  participants: readonly Participant[],
  countingDurationMs = COUNTING_DURATION_MS,
): RoundVm {
  const [phase, setPhase] = useState<RoundPhase>('voting');

  const canReveal = allVoted(participants);
  const results = useMemo(
    () => (phase === 'revealed' ? computeVoteResults(participants) : null),
    [phase, participants],
  );

  const reveal = useCallback(() => {
    if (canReveal) {
      setPhase('counting');
    }
  }, [canReveal]);

  const reset = useCallback(() => setPhase('voting'), []);

  useEffect(() => {
    if (phase !== 'counting') {
      return;
    }
    const timer = window.setTimeout(() => setPhase('revealed'), countingDurationMs);
    return () => window.clearTimeout(timer);
  }, [phase, countingDurationMs]);

  return { phase, canReveal, results, reveal, reset };
}
