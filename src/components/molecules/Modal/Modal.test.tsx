import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '@/components/molecules/Modal/Modal';

describe('Modal', () => {
  it('should not render anything when closed', () => {
    // Arrange & Act
    render(
      <Modal title="Crear usuario" isOpen={false}>
        <button>Dentro</button>
      </Modal>,
    );

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render an accessible modal dialog when open', () => {
    // Arrange & Act
    render(
      <Modal title="Crear usuario" isOpen>
        <button>Dentro</button>
      </Modal>,
    );

    // Assert
    const dialog = screen.getByRole('dialog', { name: 'Crear usuario' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should keep focus trapped inside the dialog when tabbing', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <Modal title="Crear usuario" isOpen>
        <button>Único</button>
      </Modal>,
    );

    // Act
    await user.tab();

    // Assert
    expect(screen.getByRole('button', { name: 'Único' })).toHaveFocus();
  });

  it('should close with Escape when onClose is provided', async () => {
    // Arrange
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Invitar jugadores" isOpen onClose={onClose}>
        <button>Dentro</button>
      </Modal>,
    );

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not close with Escape when onClose is omitted', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <Modal title="Crear usuario" isOpen>
        <button>Dentro</button>
      </Modal>,
    );

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
