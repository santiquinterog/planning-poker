import { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { CardList } from '@/contexts/game/components/CardList/CardList';
import { GameHeader } from '@/contexts/game/components/GameHeader/GameHeader';
import { InviteModal } from '@/contexts/game/components/InviteModal/InviteModal';
import { PlayerSeat } from '@/contexts/game/components/PlayerSeat/PlayerSeat';
import { PokerTable } from '@/contexts/game/components/PokerTable/PokerTable';
import { RevealButton } from '@/contexts/game/components/RevealButton/RevealButton';
import { useGameVm } from '@/contexts/game/hooks/useGameVm';
import { useParticipantsVm } from '@/contexts/game/hooks/useParticipantsVm';
import { CreateAdminModal } from '@/contexts/user/components/CreateAdminModal/CreateAdminModal';
import { canInteractWithCards } from '@/contexts/user/domain/user';
import { useCurrentUserVm } from '@/contexts/user/hooks/useCurrentUserVm';
import { ROUTES } from '@/config/routes';
import { PageLayout } from '@/components/templates/PageLayout/PageLayout';

export function GamePage() {
  const { slug } = useParams();
  const { game } = useGameVm(slug);
  const { user, refresh } = useCurrentUserVm(slug ?? '');
  const { participants } = useParticipantsVm();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  if (!slug || !game) {
    return <Navigate to={ROUTES.createGame} replace />;
  }

  // Solo el jugador ve y usa las cartas; el espectador dirige y revela.
  const isPlayer = user ? canInteractWithCards(user.role) : false;
  const isHost = user?.role === 'spectator';

  return (
    <PageLayout
      header={
        <GameHeader
          gameName={game.name}
          currentUserName={user?.name ?? null}
          onInvite={() => setIsInviteOpen(true)}
        />
      }
    >
      <div className="flex w-full flex-col items-center gap-12">
        <PokerTable
          participants={participants}
          currentSeat={user ? <PlayerSeat name={user.name} /> : undefined}
          centerSlot={isHost ? <RevealButton /> : undefined}
        />
        {isPlayer && <CardList interactive />}
      </div>
      {!user && <CreateAdminModal gameSlug={slug} onCreated={refresh} />}
      <InviteModal isOpen={isInviteOpen} gameSlug={slug} onClose={() => setIsInviteOpen(false)} />
    </PageLayout>
  );
}
