import { Button } from '@/components/atoms/Button/Button';
import { Modal } from '@/components/molecules/Modal/Modal';
import { useInviteVm } from '@/contexts/game/hooks/useInviteVm';

interface InviteModalProps {
  isOpen: boolean;
  gameSlug: string;
  onClose: () => void;
  // Inyección opcional para pruebas (origen y portapapeles).
  clipboard?: Pick<Navigator['clipboard'], 'writeText'>;
}

// Figma (80:622): cabecera morada con título y X, cuerpo oscuro con el link y "Copiar link".
export function InviteModal({ isOpen, gameSlug, onClose, clipboard }: InviteModalProps) {
  const { link, copyLabel, copyLink } = useInviteVm(gameSlug, { clipboard });

  return (
    <Modal title="Invitar jugadores" isOpen={isOpen} onClose={onClose}>
      <div className="border-secondary-purple-500 overflow-hidden rounded-3xl border bg-surface-900">
        <header className="flex items-center gap-4 bg-primary-purple-500 px-6 py-4">
          <h2 className="flex-1 text-h6 font-bold text-white">Invitar jugadores</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-6 cursor-pointer items-center justify-center rounded-full text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>
        <div className="flex flex-col items-center gap-6 px-6 py-8">
          <input
            readOnly
            value={link}
            aria-label="Enlace de la partida"
            onFocus={(event) => event.target.select()}
            className="h-10 w-full min-w-0 truncate rounded-full border border-primary-purple-500 bg-primary-purple-500/8 px-4 text-p3 text-white"
          />
          <Button onClick={copyLink}>{copyLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
