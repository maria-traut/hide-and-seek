import { create } from 'zustand';
import { socket } from '../socket';
import type { Game, PlayerPosition } from '@hide-and-seek/shared';
import type { RoomActions, RoomState } from '../type/room.type';

const initialState = {
  connected: false,
  clientId: null,
  roomId: null,
  game: null,
};

export const useRoomStore = create<RoomState & RoomActions>()((set) => {
  socket.on('connect', () => {
    set({ connected: true });
  });

  socket.on('disconnect', () => set({ connected: false }));

  socket.on('clientId', (clientId: string) => {
    set({ clientId });
  });
  socket.on('roomAssigned', (roomId: string) => {
    set({ roomId });
  });

  socket.on('gameData', (game: Game) => {
    set({ game });
  });

  socket.on(
    'playerAction',
    ({
      clientId,
      position,
    }: {
      clientId: string;
      position: PlayerPosition;
    }) => {
      set((state) => {
        if (!state.game) return state;

        const player = state.game.players[clientId];

        if (!player) return state;

        return {
          game: {
            ...state.game,
            players: {
              ...state.game.players,
              [clientId]: {
                ...player,
                position,
              },
            },
          },
        };
      });
    },
  );
  return {
    ...initialState,

    sendMovement: (movement) => {
      socket.emit('action', {
        movement,
      });
    },
  };
});
