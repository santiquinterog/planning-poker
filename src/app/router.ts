import { createBrowserRouter, redirect } from 'react-router';

export const router = createBrowserRouter([
  {
    HydrateFallback: () => null,
    children: [
      {
        index: true,
        lazy: async () => {
          const { CreateGamePage } =
            await import('@/contexts/game/pages/CreateGamePage/CreateGamePage');
          return { Component: CreateGamePage };
        },
      },
      {
        path: 'partida/:gameId',
        lazy: async () => {
          const { GamePage } = await import('@/contexts/game/pages/GamePage/GamePage');
          return { Component: GamePage };
        },
      },
      { path: '*', loader: () => redirect('/') },
    ],
  },
]);
