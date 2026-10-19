import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/atoms/Button/Button';

describe('Button', () => {
  it('should render as a non-submit button by default', () => {
    // Arrange & Act
    render(<Button>Crear partida</Button>);

    // Assert
    expect(screen.getByRole('button', { name: 'Crear partida' })).toHaveAttribute('type', 'button');
  });

  it('should call onClick when it is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Crear partida</Button>);

    // Act
    await user.click(screen.getByRole('button', { name: 'Crear partida' }));

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when it is disabled', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Crear partida
      </Button>,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Crear partida' }));

    // Assert
    expect(handleClick).not.toHaveBeenCalled();
  });
});
