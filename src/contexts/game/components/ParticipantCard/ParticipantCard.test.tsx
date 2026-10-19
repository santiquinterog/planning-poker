import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ParticipantCard } from '@/contexts/game/components/ParticipantCard/ParticipantCard';

describe('ParticipantCard', () => {
  it('should show the participant name', () => {
    // Arrange & Act
    render(<ParticipantCard name="Oscar" vote={null} />);

    // Assert
    expect(screen.getByText('Oscar')).toBeInTheDocument();
  });

  it('should describe the card as not voted yet', () => {
    // Arrange & Act
    render(<ParticipantCard name="Oscar" vote={null} />);

    // Assert
    expect(screen.getByRole('img', { name: 'Oscar aún no elige carta' })).toBeInTheDocument();
  });

  it('should describe a voted card without showing the value while hidden', () => {
    // Arrange & Act
    render(<ParticipantCard name="Oscar" vote="5" />);

    // Assert
    expect(screen.getByRole('img', { name: 'Oscar ya eligió carta' })).toBeInTheDocument();
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('should show the value once revealed', () => {
    // Arrange & Act
    render(<ParticipantCard name="Oscar" vote="5" revealed />);

    // Assert
    expect(screen.getByRole('img', { name: 'Oscar eligió 5' })).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
