import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Logo } from '@/components/atoms/Logo/Logo';

describe('Logo', () => {
  it('should render an image with the default accessible name', () => {
    // Arrange & Act
    render(<Logo />);

    // Assert
    expect(screen.getByRole('img', { name: 'Planning Poker' })).toBeInTheDocument();
  });

  it('should render as decorative when alt is empty', () => {
    // Arrange & Act
    render(<Logo alt="" />);

    // Assert
    expect(screen.getByRole('presentation')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
