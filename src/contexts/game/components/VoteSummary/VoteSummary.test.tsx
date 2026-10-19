import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VoteSummary } from '@/contexts/game/components/VoteSummary/VoteSummary';

const RESULTS = {
  tallies: [
    { value: '3' as const, count: 1 },
    { value: '13' as const, count: 3 },
    { value: '21' as const, count: 2 },
  ],
  average: 12.714,
};

describe('VoteSummary', () => {
  it('should show the average formatted in Spanish', () => {
    // Arrange & Act
    render(<VoteSummary results={RESULTS} />);

    // Assert
    expect(screen.getByText('12,7')).toBeInTheDocument();
  });

  it('should use singular for a single vote and plural otherwise', () => {
    // Arrange & Act
    render(<VoteSummary results={RESULTS} />);

    // Assert
    expect(screen.getByText('1 Voto')).toBeInTheDocument();
    expect(screen.getByText('3 Votos')).toBeInTheDocument();
  });
});
