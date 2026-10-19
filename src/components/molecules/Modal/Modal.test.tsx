import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
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
});
