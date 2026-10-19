import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RadioOption } from '@/components/molecules/RadioOption/RadioOption';

describe('RadioOption', () => {
  it('should expose the radio with its label as accessible name', () => {
    // Arrange & Act
    render(<RadioOption name="mode" value="player" label="Jugador" onChange={vi.fn()} />);

    // Assert
    expect(screen.getByRole('radio', { name: 'Jugador' })).toBeInTheDocument();
  });

  it('should reflect the checked state', () => {
    // Arrange & Act
    render(<RadioOption name="mode" value="player" label="Jugador" checked onChange={vi.fn()} />);

    // Assert
    expect(screen.getByRole('radio', { name: 'Jugador' })).toBeChecked();
  });

  it('should call onChange when selected', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<RadioOption name="mode" value="player" label="Jugador" onChange={handleChange} />);

    // Act
    await user.click(screen.getByRole('radio', { name: 'Jugador' }));

    // Assert
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
