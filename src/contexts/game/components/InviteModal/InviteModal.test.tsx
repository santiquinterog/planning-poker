import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InviteModal } from '@/contexts/game/components/InviteModal/InviteModal';

const EXPECTED_LINK = `${window.location.origin}/partida/sprint-32`;

describe('InviteModal', () => {
  it('should not render when closed', () => {
    // Arrange & Act
    render(<InviteModal isOpen={false} gameSlug="sprint-32" onClose={vi.fn()} />);

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show the read-only game link when open', () => {
    // Arrange & Act
    render(<InviteModal isOpen gameSlug="sprint-32" onClose={vi.fn()} />);

    // Assert
    const input = screen.getByLabelText('Enlace de la partida');
    expect(input).toHaveValue(EXPECTED_LINK);
    expect(input).toHaveAttribute('readonly');
  });

  it('should close when the close button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<InviteModal isOpen gameSlug="sprint-32" onClose={onClose} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should copy the link and show confirmation feedback', async () => {
    // Arrange
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    render(<InviteModal isOpen gameSlug="sprint-32" onClose={vi.fn()} clipboard={{ writeText }} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Copiar link' }));

    // Assert
    expect(writeText).toHaveBeenCalledWith(EXPECTED_LINK);
    expect(await screen.findByRole('button', { name: '¡Copiado!' })).toBeInTheDocument();
  });
});
