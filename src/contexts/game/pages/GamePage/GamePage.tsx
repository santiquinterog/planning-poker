import { Navigate, useParams } from 'react-router';
import { CardList } from '@/contexts/game/components/CardList/CardList';
import { GameHeader } from '@/contexts/game/components/GameHeader/GameHeader';
import { PlayerSeat } from '@/contexts/game/components/PlayerSeat/PlayerSeat';
import { PokerTable } from '@/contexts/game/components/PokerTable/PokerTable';
import { useGameVm } from '@/contexts/game/hooks/useGameVm';
import { CreateAdminModal } from '@/contexts/user/components/CreateAdminModal/CreateAdminModal';
import { canInteractWithCards } from '@/contexts/user/domain/user';
import { useCurrentUserVm } from '@/contexts/user/hooks/useCurrentUserVm';
import { ROUTES } from '@/config/routes';
import { PageLayout } from '@/components/templates/PageLayout/PageLayout';

export function GamePage() {
  const { slug } = useParams();
  const { game } = useGameVm(slug);
  const { user, refresh } = useCurrentUserVm(slug ?? '');

  if (!slug || !game) {
    return <Navigate to={ROUTES.createGame} replace />;
  }

  // Admin y jugador ven las cartas; solo el jugador puede interactuar (como en un sprint planning).
  const interactive = user ? canInteractWithCards(user.role) : false;

  return (
    <PageLayout header={<GameHeader gameName={game.name} currentUserName={user?.name ?? null} />}>
      <div className="flex w-full flex-col items-center gap-12">
        <PokerTable seat={user ? <PlayerSeat name={user.name} /> : undefined} />
        {user && <CardList interactive={interactive} />}
      </div>
      {!user && <CreateAdminModal gameSlug={slug} onCreated={refresh} />}
    </PageLayout>
  );
}
