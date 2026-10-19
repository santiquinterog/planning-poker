import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCreateGameVm } from '@/contexts/game/hooks/useCreateGameVm';
import { CreateGamePage } from '@/contexts/game/pages/CreateGamePage/CreateGamePage';

vi.mock('@/contexts/game/hooks/useCreateGameVm', () => ({ useCreateGameVm: vi.fn() }));

function mockViewModel(overrides: Partial<ReturnType<typeof useCreateGameVm>> = {}) {
  const vm = {
    name: '',
    nameError: null,
    submitError: null,
    canSubmit: false,
    handleNameChange: vi.fn(),
    handleNameBlur: vi.fn(),
    handleSubmit: vi.fn(),
    ...overrides,
  };
  vi.mocked(useCreateGameVm).mockReturnValue(vm);
  return vm;
}

describe('CreateGamePage', () => {
  beforeEach(() => {
    vi.mocked(useCreateGameVm).mockReset();
  });

  it('should show the page title', () => {
    // Arrange
    mockViewModel();

    // Act
    render(<CreateGamePage />);

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Crear partida' })).toBeInTheDocument();
  });

  it('should show the name error exposed by the view model', () => {
    // Arrange
    mockViewModel({ nameError: 'Solo se permiten letras, números y espacios' });

    // Act
    render(<CreateGamePage />);

    // Assert
    expect(screen.getByLabelText('Nombra la partida')).toHaveAccessibleDescription(
      'Solo se permiten letras, números y espacios',
    );
  });

  it('should send the typed name to the view model', async () => {
    // Arrange
    const user = userEvent.setup();
    const vm = mockViewModel();
    render(<CreateGamePage />);

    // Act
    await user.type(screen.getByLabelText('Nombra la partida'), 'S');

    // Assert
    expect(vm.handleNameChange).toHaveBeenCalledWith('S');
  });

  it('should submit through the view model when the name is valid', async () => {
    // Arrange
    const user = userEvent.setup();
    const vm = mockViewModel({ name: 'Sprint 32', canSubmit: true });
    render(<CreateGamePage />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Crear partida' }));

    // Assert
    expect(vm.handleSubmit).toHaveBeenCalledTimes(1);
  });
});
