import { create } from "zustand";
import { socket } from "../socket";
import type { GameData, PlayerData } from "../component/Room";

type RoomState = {
  results: Record<string, number>;
  connected: boolean;
  roomId: string | null;
  status: "running" | "finished" | "waiting";
  players: Record<string, PlayerData>;
  startTime: number;
  duration: number;
  rows: number;
  columns: number;
};

type Action = {
  updateResults: (results: RoomState["results"]) => void;
  joinRoom: (roomId: string) => void;
  action?: (movement: string, clientId: string) => void;
};

const initialState: RoomState = {
  results: {},
  connected: false,
  roomId: null,
  status: "waiting",
  players: {},
  startTime: 0,
  duration: 0,
  rows: 0,
  columns: 0,
};

export const useRoomStore = create<RoomState & Action>()((set, get) => {
  socket.on("connect", () => {
    set({ connected: true });
    const { roomId } = get();
    const allGet = get();
    console.log("useRoomStore contents", allGet);
    if (roomId) socket.emit("joinRoom", roomId);
  });
  socket.on("disconnect", () => set({ connected: false }));
  socket.on("results", (results: Record<string, number>) => set({ results }));

  socket.on("gameData", (gameData: GameData) => {
    const { duration, startTime, status, rows, columns } = gameData;
    console.log(
      "room store game data: ",
      duration,
      startTime,
      status,
      rows,
      columns,
    );
    set({ duration, startTime, status, rows, columns });
  });

  socket.on("playerData", (playerData: PlayerData) => {
    console.log("room store player data: ", playerData);
    set((state) => ({
      players: {
        ...state.players,
        [playerData.clientId]: playerData,
      },
    }));
  });

  socket.on(
    "playerAction",
    (
      playerData: Pick<
        PlayerData,
        "position" | "clientId" | "opponentPosition"
      >,
    ) => {
      console.log("new Position: ", playerData, playerData.clientId);
      if (playerData.position) {
        set((state) => ({
          players: {
            ...state.players,
            [playerData.clientId]: {
              ...state.players[playerData.clientId],
              position: playerData.position,
            },
          },
        }));
      } else {
        set((state) => ({
          players: {
            ...state.players,
            [playerData.clientId]: {
              ...state.players[playerData.clientId],
              opponentPosition: playerData.opponentPosition,
            },
          },
        }));
      }
    },
  );
  return {
    ...initialState,

    joinRoom: (roomId) => {
      console.log("room store", "join room", roomId);
      set({ roomId });
      if (socket.connected) {
        socket.emit("joinRoom", roomId);
      } else {
        socket.connect();
      }
    },
    updateResults: (results) => {
      set({ results });
    },
    // action: (movement, clientId) =>
    //   socket.emit("action", { roomId: get().roomId, movement, clientId }),
  };
});
