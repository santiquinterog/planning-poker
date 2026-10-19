import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '@/components/atoms/Input/Input';

describe('Input', () => {
  it('should show the value it receives', () => {
    // Arrange & Act
    render(<Input aria-label="Nombre" value="Sprint 32" onChange={vi.fn()} />);

    // Assert
    expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Sprint 32');
  });

  it('should call onChange when the user types', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input aria-label="Nombre" onChange={handleChange} />);

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Nombre' }), 'S');

    // Assert
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
