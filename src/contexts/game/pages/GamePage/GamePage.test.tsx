import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameVm } from '@/contexts/game/hooks/useGameVm';
import { GamePage } from '@/contexts/game/pages/GamePage/GamePage';

vi.mock('@/contexts/game/hooks/useGameVm', () => ({ useGameVm: vi.fn() }));

function renderAtGame(gameId: string) {
  render(
    <MemoryRouter initialEntries={[`/partida/${gameId}`]}>
      <Routes>
        <Route path="/partida/:gameId" element={<GamePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('GamePage', () => {
  beforeEach(() => {
    vi.mocked(useGameVm).mockReset();
  });

  it('should request the game using the id from the URL', () => {
    // Arrange
    vi.mocked(useGameVm).mockReturnValue({ game: null });

    // Act
    renderAtGame('game-1');

    // Assert
    expect(useGameVm).toHaveBeenCalledWith('game-1');
  });

  it('should show the game name as the title when the game exists', () => {
    // Arrange
    vi.mocked(useGameVm).mockReturnValue({
      game: { id: 'game-1', name: 'Sprint 32', createdAt: '2026-10-16T10:00:00.000Z' },
    });

    // Act
    renderAtGame('game-1');

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Sprint 32' })).toBeInTheDocument();
  });

  it('should offer a link to create a game when the game does not exist', () => {
    // Arrange
    vi.mocked(useGameVm).mockReturnValue({ game: null });

    // Act
    renderAtGame('missing');

    // Assert
    expect(
      screen.getByRole('heading', { level: 1, name: 'Partida no encontrada' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Crear una partida' })).toHaveAttribute('href', '/');
  });
});
