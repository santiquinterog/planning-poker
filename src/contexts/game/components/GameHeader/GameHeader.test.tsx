import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GameHeader } from '@/contexts/game/components/GameHeader/GameHeader';

describe('GameHeader', () => {
  it('should hide the title and actions when there is no current user', () => {
    // Arrange & Act
    render(<GameHeader gameName="Sprint 32" currentUserName={null} />);

    // Assert
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Invitar jugadores' })).not.toBeInTheDocument();
  });

  it('should show the game name and invite action once there is a user', () => {
    // Arrange & Act
    render(<GameHeader gameName="Sprint 32" currentUserName="Luisa" />);

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Sprint 32' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invitar jugadores' })).toBeInTheDocument();
    expect(screen.getByText('LU')).toBeInTheDocument();
  });
});
