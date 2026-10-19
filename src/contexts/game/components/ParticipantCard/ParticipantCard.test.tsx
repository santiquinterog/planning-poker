import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ParticipantCard } from '@/contexts/game/components/ParticipantCard/ParticipantCard';

describe('ParticipantCard', () => {
  it('should show the participant name', () => {
    // Arrange & Act
    render(<ParticipantCard name="Oscar" hasVoted={false} />);

    // Assert
    expect(screen.getByText('Oscar')).toBeInTheDocument();
  });

  it('should describe the card as not voted yet', () => {
    // Arrange & Act
    render(<ParticipantCard name="Oscar" hasVoted={false} />);

    // Assert
    expect(screen.getByRole('img', { name: 'Oscar aún no elige carta' })).toBeInTheDocument();
  });

  it('should describe the card as already voted', () => {
    // Arrange & Act
    render(<ParticipantCard name="Oscar" hasVoted />);

    // Assert
    expect(screen.getByRole('img', { name: 'Oscar ya eligió carta' })).toBeInTheDocument();
  });
});
