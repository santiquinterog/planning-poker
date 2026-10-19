import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TextField } from '@/components/molecules/TextField/TextField';

describe('TextField', () => {
  it('should associate the label with the input', () => {
    // Arrange & Act
    render(<TextField label="Nombra la partida" />);

    // Assert
    expect(screen.getByLabelText('Nombra la partida')).toBeInTheDocument();
  });

  it('should not mark the input as invalid when there is no error', () => {
    // Arrange & Act
    render(<TextField label="Nombra la partida" error={null} />);

    // Assert
    const input = screen.getByLabelText('Nombra la partida');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAccessibleDescription();
  });

  it('should mark the input as invalid and describe it with the error', () => {
    // Arrange & Act
    render(<TextField label="Nombra la partida" error="El nombre es obligatorio" />);

    // Assert
    const input = screen.getByLabelText('Nombra la partida');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('El nombre es obligatorio');
  });

  it('should forward onChange to the input', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<TextField label="Nombra la partida" onChange={handleChange} />);

    // Act
    await user.type(screen.getByLabelText('Nombra la partida'), 'S');

    // Assert
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
