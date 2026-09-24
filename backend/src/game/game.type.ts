export type GameStatus = 'waiting' | 'running' | 'finished';

export type Movement = 'up' | 'down' | 'left' | 'right';

export type GridSize = 5 | 10 | 15 | 20;

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

export type GameEndReason = 'caught' | 'timeout';

export type Game = {
  status: GameStatus;
  duration: number;
  rows: number;
  columns: number;
  players: Record<string, Player>;
  winner?: PlayerRole;
};
