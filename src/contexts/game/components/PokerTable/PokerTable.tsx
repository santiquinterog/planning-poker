import type { ReactNode } from 'react';
import { ParticipantCard } from '@/contexts/game/components/ParticipantCard/ParticipantCard';
import { hasVoted } from '@/contexts/game/domain/participant';
import type { Participant } from '@/contexts/game/domain/participant';

interface PokerTableProps {
  participants: readonly Participant[];
  currentSeat?: ReactNode;
  centerSlot?: ReactNode;
}

// Figma (60:874 / 60:994): mesa en forma de estadio con participantes alrededor.
// Posiciones: 3 arriba, 1 a cada lado, resto abajo con el usuario actual en el centro.
// Inferencia mobile: si no caben alrededor, los participantes se apilan bajo la mesa.
const TOP_COUNT = 3;
const SIDE_COUNT = 2;

export function PokerTable({ participants, currentSeat, centerSlot }: PokerTableProps) {
  const top = participants.slice(0, TOP_COUNT);
  const sides = participants.slice(TOP_COUNT, TOP_COUNT + SIDE_COUNT);
  const bottom = participants.slice(TOP_COUNT + SIDE_COUNT);
  const [leftSeat, rightSeat] = sides;

  // El usuario actual va en la mitad de la fila inferior.
  const middle = Math.ceil(bottom.length / 2);
  const bottomLeft = bottom.slice(0, middle);
  const bottomRight = bottom.slice(middle);

  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-6">
      <ul className="flex justify-center gap-10 md:gap-16">
        {top.map((participant) => (
          <li key={participant.id}>
            <ParticipantCard name={participant.name} hasVoted={hasVoted(participant)} />
          </li>
        ))}
      </ul>

      <div className="flex w-full items-center justify-center gap-4 md:gap-8">
        {leftSeat && <ParticipantCard name={leftSeat.name} hasVoted={hasVoted(leftSeat)} />}

        <div className="relative aspect-[603/345] w-full max-w-[640px] shrink">
          <div className="absolute inset-0 rounded-[172px] border-2 border-primary-purple-500 shadow-ring" />
          <div className="absolute inset-[4%_4%] rounded-[172px] border-2 border-primary-purple-500 shadow-glow-03" />
          <div className="absolute inset-[9.5%_7.5%] rounded-[172px] border border-primary-purple-500 bg-surface-900/40 shadow-100" />
          {centerSlot && (
            <div className="absolute inset-0 flex items-center justify-center">{centerSlot}</div>
          )}
        </div>

        {rightSeat && <ParticipantCard name={rightSeat.name} hasVoted={hasVoted(rightSeat)} />}
      </div>

      <ul className="flex items-start justify-center gap-10 md:gap-16">
        {bottomLeft.map((participant) => (
          <li key={participant.id}>
            <ParticipantCard name={participant.name} hasVoted={hasVoted(participant)} />
          </li>
        ))}
        {currentSeat && <li>{currentSeat}</li>}
        {bottomRight.map((participant) => (
          <li key={participant.id}>
            <ParticipantCard name={participant.name} hasVoted={hasVoted(participant)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
