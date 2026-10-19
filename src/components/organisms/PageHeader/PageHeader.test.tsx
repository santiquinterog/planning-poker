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

  it('should render the logo as decorative', () => {
    // Arrange & Act
    render(<PageHeader title="Crear partida" />);

    // Assert
    expect(screen.getByRole('banner')).toContainElement(screen.getByRole('presentation'));
  });

  it('should render the actions passed to it', () => {
    // Arrange & Act
    render(<PageHeader title="Sprint 32" actions={<button>Invitar jugadores</button>} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Invitar jugadores' })).toBeInTheDocument();
  });

  it('should not render a heading when no title is given', () => {
    // Arrange & Act
    render(<PageHeader />);

    // Assert
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
