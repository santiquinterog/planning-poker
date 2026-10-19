import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AdminForm } from '@/contexts/user/components/AdminForm/AdminForm';

function renderForm(overrides: Partial<Parameters<typeof AdminForm>[0]> = {}) {
  const props = {
    name: '',
    nameError: null,
    role: null,
    submitError: null,
    canSubmit: false,
    onNameChange: vi.fn(),
    onNameBlur: vi.fn(),
    onRoleChange: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  };
  render(<AdminForm {...props} />);
  return props;
}

describe('AdminForm', () => {
  it('should render the two roles as radios', () => {
    // Arrange & Act
    renderForm();

    // Assert
    expect(screen.getByRole('radio', { name: 'Jugador' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Espectador' })).toBeInTheDocument();
  });

  it('should disable the submit button when it cannot be submitted', () => {
    // Arrange & Act
    renderForm({ canSubmit: false });

    // Assert
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  it('should mark the selected role as checked', () => {
    // Arrange & Act
    renderForm({ role: 'spectator' });

    // Assert
    expect(screen.getByRole('radio', { name: 'Espectador' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Jugador' })).not.toBeChecked();
  });

  it('should notify the chosen role', async () => {
    // Arrange
    const user = userEvent.setup();
    const props = renderForm();

    // Act
    await user.click(screen.getByRole('radio', { name: 'Jugador' }));

    // Assert
    expect(props.onRoleChange).toHaveBeenCalledWith('player');
  });

  it('should submit when enabled', async () => {
    // Arrange
    const user = userEvent.setup();
    const props = renderForm({ name: 'Luisa', role: 'player', canSubmit: true });

    // Act
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    // Assert
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should show the name error on the input', () => {
    // Arrange & Act
    renderForm({ nameError: 'Tu nombre es obligatorio' });

    // Assert
    expect(screen.getByLabelText('Tu nombre')).toHaveAccessibleDescription(
      'Tu nombre es obligatorio',
    );
  });
});
