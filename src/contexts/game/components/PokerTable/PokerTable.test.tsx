import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PokerTable } from '@/contexts/game/components/PokerTable/PokerTable';
import type { Participant } from '@/contexts/game/domain/participant';

const PARTICIPANTS: Participant[] = [
  { id: 'p1', name: 'Oscar', vote: '5' },
  { id: 'p2', name: 'David', vote: null },
  { id: 'p3', name: 'Vale', vote: null },
  { id: 'p4', name: 'Nata', vote: '3' },
];

describe('PokerTable', () => {
  it('should render every participant', () => {
    // Arrange & Act
    render(<PokerTable participants={PARTICIPANTS} />);

    // Assert
    ['Oscar', 'David', 'Vale', 'Nata'].forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it('should mark a voted participant card', () => {
    // Arrange & Act
    render(<PokerTable participants={PARTICIPANTS} />);

    // Assert
    expect(screen.getByRole('img', { name: 'Oscar ya eligió carta' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'David aún no elige carta' })).toBeInTheDocument();
  });

  it('should render the current seat between the bottom participants', () => {
    // Arrange & Act
    render(<PokerTable participants={PARTICIPANTS} currentSeat={<span>Luisa</span>} />);

    // Assert
    expect(screen.getByText('Luisa')).toBeInTheDocument();
  });

  it('should render the center slot when provided', () => {
    // Arrange & Act
    render(<PokerTable participants={PARTICIPANTS} centerSlot={<button>Revelar cartas</button>} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Revelar cartas' })).toBeInTheDocument();
  });

  it('should not render a center slot when omitted', () => {
    // Arrange & Act
    render(<PokerTable participants={PARTICIPANTS} />);

    // Assert
    expect(screen.queryByRole('button', { name: 'Revelar cartas' })).not.toBeInTheDocument();
  });
});
