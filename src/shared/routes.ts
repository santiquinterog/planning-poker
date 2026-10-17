export const ROUTES = {
  createGame: '/',
  game: (gameId: string) => `/partida/${encodeURIComponent(gameId)}`,
} as const;
