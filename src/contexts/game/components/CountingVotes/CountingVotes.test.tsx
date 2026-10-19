import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CountingVotes } from '@/contexts/game/components/CountingVotes/CountingVotes';

describe('CountingVotes', () => {
  it('should announce the counting status', () => {
    // Arrange & Act
    render(<CountingVotes />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Contando votos');
  });
});
