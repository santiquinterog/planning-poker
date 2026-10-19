import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CardList } from '@/contexts/game/components/CardList/CardList';

describe('CardList', () => {
  it('should render the fibonacci deck without 0 or a duplicated 1', () => {
    // Arrange & Act
    render(<CardList interactive />);

    // Assert
    const labels = screen.getAllByRole('button').map((button) => button.textContent);
    expect(labels).toEqual(['1', '2', '3', '5', '8', '13', '21']);
  });

  it('should disable every card when not interactive', () => {
    // Arrange & Act
    render(<CardList interactive={false} />);

    // Assert
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
  });

  it('should notify the selected value when interactive', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CardList interactive onSelect={onSelect} />);

    // Act
    await user.click(screen.getByRole('button', { name: '8' }));

    // Assert
    expect(onSelect).toHaveBeenCalledWith('8');
  });

  it('should not notify selection when not interactive', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CardList interactive={false} onSelect={onSelect} />);

    // Act
    await user.click(screen.getByRole('button', { name: '8' }));

    // Assert
    expect(onSelect).not.toHaveBeenCalled();
  });
});
