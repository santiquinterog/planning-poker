import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCreateAdminVm } from '@/contexts/user/hooks/useCreateAdminVm';
import type { UserService } from '@/contexts/user/services/user-service';
import { InvalidUserNameError } from '@/contexts/user/services/user-service';

function setup(service: Pick<UserService, 'createUser'>, onCreated = vi.fn()) {
  const view = renderHook(() => useCreateAdminVm('sprint-32', onCreated, service));
  return { ...view, onCreated };
}

describe('useCreateAdminVm', () => {
  it('should not allow submit until the name is valid and a role is chosen', () => {
    // Arrange
    const { result } = setup({ createUser: vi.fn() });

    // Act
    act(() => result.current.handleNameChange('Luisa'));

    // Assert
    expect(result.current.canSubmit).toBe(false);

    // Act
    act(() => result.current.handleRoleChange('player'));

    // Assert
    expect(result.current.canSubmit).toBe(true);
  });

  it('should create the user with the chosen role and notify onCreated on submit', () => {
    // Arrange
    const createUser = vi.fn().mockReturnValue({ id: 'user-1' });
    const { result, onCreated } = setup({ createUser });

    // Act
    act(() => result.current.handleNameChange('Luisa'));
    act(() => result.current.handleRoleChange('spectator'));
    act(() => result.current.handleSubmit());

    // Assert
    expect(createUser).toHaveBeenCalledWith({
      gameSlug: 'sprint-32',
      name: 'Luisa',
      role: 'spectator',
    });
    expect(onCreated).toHaveBeenCalledTimes(1);
  });

  it('should not create the user when no role is selected', () => {
    // Arrange
    const createUser = vi.fn();
    const { result, onCreated } = setup({ createUser });

    // Act
    act(() => result.current.handleNameChange('Luisa'));
    act(() => result.current.handleSubmit());

    // Assert
    expect(createUser).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('should expose a submit error when the service fails', () => {
    // Arrange
    const createUser = vi.fn(() => {
      throw new InvalidUserNameError('fallo');
    });
    const { result, onCreated } = setup({ createUser });

    // Act
    act(() => result.current.handleNameChange('Luisa'));
    act(() => result.current.handleRoleChange('player'));
    act(() => result.current.handleSubmit());

    // Assert
    expect(result.current.submitError).not.toBeNull();
    expect(onCreated).not.toHaveBeenCalled();
  });
});
