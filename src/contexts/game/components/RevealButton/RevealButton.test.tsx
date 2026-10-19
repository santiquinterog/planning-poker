import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RevealButton } from '@/contexts/game/components/RevealButton/RevealButton';

describe('RevealButton', () => {
  it('should render the reveal action', () => {
    // Arrange & Act
    render(<RevealButton />);

    // Assert
    expect(screen.getByRole('button', { name: 'Revelar cartas' })).toBeInTheDocument();
  });

  it('should call onReveal when clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const onReveal = vi.fn();
    render(<RevealButton onReveal={onReveal} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Revelar cartas' }));

    // Assert
    expect(onReveal).toHaveBeenCalledTimes(1);
  });
});
