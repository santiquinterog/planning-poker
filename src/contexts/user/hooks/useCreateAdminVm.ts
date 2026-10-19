import { useCallback, useMemo, useState } from 'react';
import { getVisibleUserNameError } from '@/contexts/user/create-user-helpers';
import type { UserRole } from '@/contexts/user/domain/user';
import { validateUserName } from '@/contexts/user/domain/user-name-validation';
import type { UserService } from '@/contexts/user/services/user-service';
import { userService } from '@/contexts/user/services/user-service-instance';

export const CREATE_ADMIN_ERROR = 'No pudimos crear el usuario. Intenta de nuevo.';

export function useCreateAdminVm(
  gameSlug: string,
  onCreated: () => void,
  service: Pick<UserService, 'createUser'> = userService,
) {
  const [name, setName] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validation = useMemo(() => validateUserName(name), [name]);
  const nameError = getVisibleUserNameError(validation, isTouched);
  const canSubmit = validation.isValid && role !== null;

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    setSubmitError(null);
  }, []);

  const handleNameBlur = useCallback(() => setIsTouched(true), []);

  const handleRoleChange = useCallback((nextRole: UserRole) => {
    setRole(nextRole);
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(() => {
    setIsTouched(true);
    if (!validation.isValid || role === null) {
      return;
    }
    try {
      service.createUser({ gameSlug, name: validation.value, role });
      onCreated();
    } catch {
      setSubmitError(CREATE_ADMIN_ERROR);
    }
  }, [validation, role, service, gameSlug, onCreated]);

  return {
    name,
    nameError,
    role,
    submitError,
    canSubmit,
    handleNameChange,
    handleNameBlur,
    handleRoleChange,
    handleSubmit,
  };
}
