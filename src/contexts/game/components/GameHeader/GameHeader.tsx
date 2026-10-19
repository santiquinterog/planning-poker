import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { Button } from '@/components/atoms/Button/Button';
import { PageHeader } from '@/components/organisms/PageHeader/PageHeader';

interface GameHeaderProps {
  gameName: string;
  currentUserName: string | null;
  onInvite: () => void;
}

// Figma: encabezado de la mesa con el nombre de la partida al centro, avatar y "Invitar jugadores".
// El título y las acciones solo aparecen cuando ya hay un usuario (tras cerrar la modal).
export function GameHeader({ gameName, currentUserName, onInvite }: GameHeaderProps) {
  if (!currentUserName) {
    return <PageHeader />;
  }

  return (
    <PageHeader
      title={gameName}
      actions={
        <div className="flex items-center gap-3">
          <Avatar name={currentUserName} />
          <Button variant="outline" onClick={onInvite}>
            Invitar jugadores
          </Button>
        </div>
      }
    />
  );
}
