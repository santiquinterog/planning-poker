export const ROUTES = {
  createGame: '/',
  game: (slug: string) => `/partida/${encodeURIComponent(slug)}`,
} as const;
