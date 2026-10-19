import { useCallback, useState } from 'react';
import type { User } from '@/contexts/user/domain/user';
import type { UserService } from '@/contexts/user/services/user-service';
import { userService } from '@/contexts/user/services/user-service-instance';

export function useCurrentUserVm(
  gameSlug: string,
  service: Pick<UserService, 'getUserByGameSlug'> = userService,
) {
  const [user, setUser] = useState<User | null>(() => service.getUserByGameSlug(gameSlug));

  const refresh = useCallback(() => {
    setUser(service.getUserByGameSlug(gameSlug));
  }, [gameSlug, service]);

  return { user, refresh };
}
