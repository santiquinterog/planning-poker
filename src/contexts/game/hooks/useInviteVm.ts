import { useCallback, useMemo, useState } from 'react';
import { buildGameLink } from '@/contexts/game/domain/game-link';

export const COPY_IDLE_LABEL = 'Copiar link';
export const COPY_DONE_LABEL = '¡Copiado!';
const COPY_FEEDBACK_MS = 2000;

type Clipboard = Pick<Navigator['clipboard'], 'writeText'>;

interface InviteVmDeps {
  origin?: string;
  clipboard?: Clipboard;
}

export function useInviteVm(gameSlug: string, deps: InviteVmDeps = {}) {
  const origin = deps.origin ?? window.location.origin;
  const clipboard = deps.clipboard ?? navigator.clipboard;

  const link = useMemo(() => buildGameLink(origin, gameSlug), [origin, gameSlug]);
  const [copyLabel, setCopyLabel] = useState(COPY_IDLE_LABEL);

  const copyLink = useCallback(async () => {
    try {
      await clipboard.writeText(link);
      setCopyLabel(COPY_DONE_LABEL);
      window.setTimeout(() => setCopyLabel(COPY_IDLE_LABEL), COPY_FEEDBACK_MS);
    } catch {
      // Si el portapapeles no está disponible, el input de solo lectura queda como respaldo.
      setCopyLabel(COPY_IDLE_LABEL);
    }
  }, [clipboard, link]);

  return { link, copyLabel, copyLink };
}
