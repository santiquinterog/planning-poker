import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageHeader } from '@/components/organisms/PageHeader/PageHeader';

describe('PageHeader', () => {
  it('should show the title as the main heading', () => {
    // Arrange & Act
    render(<PageHeader title="Crear partida" />);

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Crear partida' })).toBeInTheDocument();
  });

  it('should render the logo as decorative next to the title', () => {
    // Arrange & Act
    render(<PageHeader title="Crear partida" />);

    // Assert
    expect(screen.getByRole('banner')).toContainElement(screen.getByRole('presentation'));
  });
});
