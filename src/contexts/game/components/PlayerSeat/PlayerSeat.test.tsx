import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlayerSeat } from '@/contexts/game/components/PlayerSeat/PlayerSeat';

describe('PlayerSeat', () => {
  it('should show the player name', () => {
    // Arrange & Act
    render(<PlayerSeat name="Luisa" />);

    // Assert
    expect(screen.getByText('Luisa')).toBeInTheDocument();
  });

  it('should show the avatar initials', () => {
    // Arrange & Act
    render(<PlayerSeat name="Luisa" />);

    // Assert
    expect(screen.getByText('LU')).toBeInTheDocument();
  });
});
