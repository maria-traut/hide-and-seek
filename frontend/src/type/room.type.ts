import type { Game, Movement } from '@hide-and-seek/shared';

export type RoomState = {
  connected: boolean;
  clientId: string | null;
  roomId: string | null;
  game: Game | null;
};

export type RoomActions = {
  sendMovement: (movement: Movement) => void;
};
