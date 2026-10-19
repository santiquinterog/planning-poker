import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CreateGameForm } from '@/contexts/game/components/CreateGameForm/CreateGameForm';

function renderForm(overrides: Partial<Parameters<typeof CreateGameForm>[0]> = {}) {
  const props = {
    name: '',
    nameError: null,
    submitError: null,
    canSubmit: false,
    onNameChange: vi.fn(),
    onNameBlur: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  };
  render(<CreateGameForm {...props} />);
  return props;
}

describe('CreateGameForm', () => {
  it('should disable the submit button when the name cannot be submitted', () => {
    // Arrange & Act
    renderForm({ canSubmit: false });

    // Assert
    expect(screen.getByRole('button', { name: 'Crear partida' })).toBeDisabled();
  });

  it('should call onSubmit when the button is enabled and clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const props = renderForm({ name: 'Sprint 32', canSubmit: true });

    // Act
    await user.click(screen.getByRole('button', { name: 'Crear partida' }));

    // Assert
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should notify each typed value through onNameChange', async () => {
    // Arrange
    const user = userEvent.setup();
    const props = renderForm();

    // Act
    await user.type(screen.getByLabelText('Nombra la partida'), 'S');

    // Assert
    expect(props.onNameChange).toHaveBeenCalledWith('S');
  });

  it('should show the name error and mark the input as invalid', () => {
    // Arrange & Act
    renderForm({ nameError: 'Solo se permiten letras, números y espacios' });

    // Assert
    const input = screen.getByLabelText('Nombra la partida');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Solo se permiten letras, números y espacios');
  });

  it('should show the submit error as an alert', () => {
    // Arrange & Act
    renderForm({ submitError: 'No pudimos crear la partida. Intenta de nuevo.' });

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos crear la partida');
  });
});
