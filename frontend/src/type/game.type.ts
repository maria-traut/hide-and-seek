export type GameStatus = 'waiting' | 'running' | 'finished';

export type Movement = 'up' | 'down' | 'left' | 'right';

export const GRID_SIZE_CLASSES = {
  5: 'grid-cols-5',
  10: 'grid-cols-10',
  15: 'grid-cols-15',
  20: 'grid-cols-20',
} as const;

export type GridSize = keyof typeof GRID_SIZE_CLASSES;

export type PlayerRole = 'seeker' | 'hider';

export type PlayerPosition = {
  x: number;
  y: number;
};

export type Player = {
  clientId: string;
  role: PlayerRole;
  position: PlayerPosition;
};

export type Game = {
  status: GameStatus;
  duration: number;
  rows: GridSize;
  columns: GridSize;
  players: Record<string, Player>;
  winner?: PlayerRole;
};
