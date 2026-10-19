import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PokerTable } from '@/contexts/game/components/PokerTable/PokerTable';

describe('PokerTable', () => {
  it('should render the seat content when provided', () => {
    // Arrange & Act
    render(<PokerTable seat={<span>Luisa</span>} />);

    // Assert
    expect(screen.getByText('Luisa')).toBeInTheDocument();
  });

  it('should render without a seat', () => {
    // Arrange & Act
    render(<PokerTable />);

    // Assert
    expect(screen.queryByText('Luisa')).not.toBeInTheDocument();
  });
});
