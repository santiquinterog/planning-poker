import { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { CardList } from '@/contexts/game/components/CardList/CardList';
import { CountingVotes } from '@/contexts/game/components/CountingVotes/CountingVotes';
import { GameHeader } from '@/contexts/game/components/GameHeader/GameHeader';
import { InviteModal } from '@/contexts/game/components/InviteModal/InviteModal';
import { PlayerSeat } from '@/contexts/game/components/PlayerSeat/PlayerSeat';
import { PokerTable } from '@/contexts/game/components/PokerTable/PokerTable';
import { RevealButton } from '@/contexts/game/components/RevealButton/RevealButton';
import { VoteSummary } from '@/contexts/game/components/VoteSummary/VoteSummary';
import { Button } from '@/components/atoms/Button/Button';
import { useGameVm } from '@/contexts/game/hooks/useGameVm';
import { useParticipantsVm } from '@/contexts/game/hooks/useParticipantsVm';
import { useRoundVm } from '@/contexts/game/hooks/useRoundVm';
import { CreateAdminModal } from '@/contexts/user/components/CreateAdminModal/CreateAdminModal';
import { canInteractWithCards } from '@/contexts/user/domain/user';
import { useCurrentUserVm } from '@/contexts/user/hooks/useCurrentUserVm';
import { ROUTES } from '@/config/routes';
import { PageLayout } from '@/components/templates/PageLayout/PageLayout';

export function GamePage() {
  const { slug } = useParams();
  const { game } = useGameVm(slug);
  const { user, refresh } = useCurrentUserVm(slug ?? '');
  const { participants, resetVotes } = useParticipantsVm();
  const { phase, canReveal, results, reveal, reset } = useRoundVm(participants);

  const startNewRound = () => {
    resetVotes();
    reset();
  };
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  if (!slug || !game) {
    return <Navigate to={ROUTES.createGame} replace />;
  }

  // Solo el jugador vota; el espectador dirige (revelar / nueva votación).
  const isPlayer = user ? canInteractWithCards(user.role) : false;
  const isHost = user?.role === 'spectator';
  const isRevealed = phase === 'revealed';

  const centerSlot = (() => {
    if (phase === 'counting') return <CountingVotes />;
    if (phase === 'revealed' && isHost) {
      return (
        <Button variant="primary" onClick={startNewRound}>
          Nueva votación
        </Button>
      );
    }
    if (phase === 'voting' && isHost && canReveal) return <RevealButton onReveal={reveal} />;
    return undefined;
  })();

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
          revealed={isRevealed}
          currentSeat={user ? <PlayerSeat name={user.name} /> : undefined}
          centerSlot={centerSlot}
        />
        {isPlayer && phase === 'voting' && <CardList interactive />}
        {isRevealed && results && <VoteSummary results={results} />}
      </div>
      {!user && <CreateAdminModal gameSlug={slug} onCreated={refresh} />}
      <InviteModal isOpen={isInviteOpen} gameSlug={slug} onClose={() => setIsInviteOpen(false)} />
    </PageLayout>
  );
}
