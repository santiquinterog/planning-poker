import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageLayout } from '@/components/templates/PageLayout/PageLayout';

describe('PageLayout', () => {
  it('should render the header outside the main content', () => {
    // Arrange & Act
    render(
      <PageLayout header={<header>Encabezado</header>}>
        <p>Contenido</p>
      </PageLayout>,
    );

    // Assert
    expect(screen.getByRole('banner')).toHaveTextContent('Encabezado');
    expect(screen.getByRole('main')).not.toContainElement(screen.getByRole('banner'));
  });

  it('should render the children inside the main content', () => {
    // Arrange & Act
    render(
      <PageLayout header={<header>Encabezado</header>}>
        <p>Contenido</p>
      </PageLayout>,
    );

    // Assert
    expect(screen.getByRole('main')).toHaveTextContent('Contenido');
  });
});
