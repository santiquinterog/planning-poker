import { Link, useParams } from 'react-router';
import { useGameVm } from '@/contexts/game/hooks/useGameVm';
import { ROUTES } from '@/config/routes';
import { PageHeader } from '@/components/organisms/PageHeader/PageHeader';
import { PageLayout } from '@/components/templates/PageLayout/PageLayout';

// Placeholder: la mesa de juego se implementa en una HU posterior.
export function GamePage() {
  const { gameId } = useParams();
  const { game } = useGameVm(gameId);

  if (!game) {
    return (
      <PageLayout header={<PageHeader title="Partida no encontrada" />}>
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-base text-white">No encontramos esta partida.</p>
          <Link
            to={ROUTES.createGame}
            className="inline-flex min-h-11 items-center rounded-full px-6 text-h6 font-semibold text-gray-50 underline underline-offset-4"
          >
            Crear una partida
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout header={<PageHeader title={game.name} />}>
      <p className="text-center text-base text-white">Partida creada. Aquí irá la mesa de juego.</p>
    </PageLayout>
  );
}
