import { z } from 'zod';

export const gameSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.string().min(1),
});

export type Game = z.infer<typeof gameSchema>;
