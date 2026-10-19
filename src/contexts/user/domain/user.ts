import { z } from 'zod';

// El rol es cómo participa el usuario en la partida:
//   player     -> ve las cartas e interactúa (vota).
//   spectator  -> ve las cartas pero no interactúa (dirige, como el Scrum Master).
export const USER_ROLES = ['player', 'spectator'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const userSchema = z.object({
  id: z.string().min(1),
  gameSlug: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(USER_ROLES),
  createdAt: z.string().min(1),
});

export type User = z.infer<typeof userSchema>;

export function canInteractWithCards(role: UserRole): boolean {
  return role === 'player';
}
