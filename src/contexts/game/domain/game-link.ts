import { ROUTES } from '@/config/routes';

// Enlace absoluto para compartir la partida, basado en el origen real de la app.
export function buildGameLink(origin: string, slug: string): string {
  return `${origin}${ROUTES.game(slug)}`;
}
