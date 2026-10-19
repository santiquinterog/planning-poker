import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameVm } from '@/contexts/game/hooks/useGameVm';
import { useCurrentUserVm } from '@/contexts/user/hooks/useCurrentUserVm';
import { GamePage } from '@/contexts/game/pages/GamePage/GamePage';
import type { User } from '@/contexts/user/domain/user';

vi.mock('@/contexts/game/hooks/useGameVm', () => ({ useGameVm: vi.fn() }));
vi.mock('@/contexts/user/hooks/useCurrentUserVm', () => ({ useCurrentUserVm: vi.fn() }));

const GAME = { slug: 'sprint-32', name: 'Sprint 32', createdAt: '2026-10-16T10:00:00.000Z' };

const PLAYER: User = {
  id: 'u1',
  gameSlug: 'sprint-32',
  name: 'Luisa',
  role: 'player',
  createdAt: '2026-10-16T10:00:00.000Z',
};

function renderAtGame(slug: string) {
  render(
    <MemoryRouter initialEntries={[`/partida/${slug}`]}>
      <Routes>
        <Route path="/partida/:slug" element={<GamePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function mockUser(user: User | null) {
  vi.mocked(useCurrentUserVm).mockReturnValue({ user, refresh: vi.fn() });
}

describe('GamePage', () => {
  beforeEach(() => {
    vi.mocked(useGameVm).mockReset();
    vi.mocked(useCurrentUserVm).mockReset();
    vi.mocked(useGameVm).mockReturnValue({ game: GAME });
  });

  it('should request the game using the slug from the URL', () => {
    // Arrange
    mockUser(PLAYER);

    // Act
    renderAtGame('sprint-32');

    // Assert
    expect(useGameVm).toHaveBeenCalledWith('sprint-32');
  });

  it('should show the admin creation modal when there is no user yet', () => {
    // Arrange
    mockUser(null);

    // Act
    renderAtGame('sprint-32');

    // Assert
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Tu nombre')).toBeInTheDocument();
  });

  it('should show the table and card list once a user exists', () => {
    // Arrange
    mockUser(PLAYER);

    // Act
    renderAtGame('sprint-32');

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Sprint 32' })).toBeInTheDocument();
    expect(screen.getByText('Elige una carta 👇')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should let a player interact with the cards', () => {
    // Arrange
    mockUser(PLAYER);

    // Act
    renderAtGame('sprint-32');

    // Assert
    expect(screen.getByRole('button', { name: '5' })).toBeEnabled();
  });

  it('should not show the cards to a spectator', () => {
    // Arrange
    mockUser({ ...PLAYER, role: 'spectator' });

    // Act
    renderAtGame('sprint-32');

    // Assert
    expect(screen.queryByText('Elige una carta 👇')).not.toBeInTheDocument();
  });

  it('should show the participants around the table', () => {
    // Arrange
    mockUser(PLAYER);

    // Act
    renderAtGame('sprint-32');

    // Assert
    expect(screen.getByText('Oscar')).toBeInTheDocument();
  });

  it('should show the reveal button only to the spectator (host)', () => {
    // Arrange
    mockUser({ ...PLAYER, role: 'spectator' });

    // Act
    renderAtGame('sprint-32');

    // Assert
    expect(screen.getByRole('button', { name: 'Revelar cartas' })).toBeInTheDocument();
  });

  it('should not show the reveal button to a player', () => {
    // Arrange
    mockUser(PLAYER);

    // Act
    renderAtGame('sprint-32');

    // Assert
    expect(screen.queryByRole('button', { name: 'Revelar cartas' })).not.toBeInTheDocument();
  });
});
