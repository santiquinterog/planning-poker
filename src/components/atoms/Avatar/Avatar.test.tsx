import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from '@/components/atoms/Avatar/Avatar';

describe('Avatar', () => {
  it('should render the first two letters of the name in uppercase', () => {
    // Arrange & Act
    render(<Avatar name="Luisa" />);

    // Assert
    expect(screen.getByText('LU')).toBeInTheDocument();
  });

  it('should be decorative (hidden from the accessibility tree)', () => {
    // Arrange & Act
    render(<Avatar name="Luisa" />);

    // Assert
    expect(screen.getByText('LU')).toHaveAttribute('aria-hidden', 'true');
  });
});
