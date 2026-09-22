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
};

export const useRoomStore = create<RoomState & Action>()((set, get) => {
  socket.on("connect", () => {
    set({ connected: true });
    const { roomId } = get();
    const allGet = get();
    console.log("all get", allGet);
    if (roomId) socket.emit("joinRoom", roomId);
  });
  socket.on("disconnect", () => set({ connected: false }));
  socket.on("results", (results: Record<string, number>) => set({ results }));

  socket.on("gameData", (gameData: GameData) => {
    const { duration, startTime, status } = gameData;
    console.log("room store game data: ", duration, startTime, status);
    set({ duration, startTime, status });
  });

  // socket.on("playerData", (playerData: PlayerData) => {
  //   const { role, clientId, position, roomId, opponentPosition } = playerData;
  //   console.log(
  //     "room store player data: ",
  //     role,
  //     clientId,
  //     position,
  //     roomId,
  //     opponentPosition,
  //   );
  //   set({ role, clientId, position, roomId, opponentPosition });
  // });

  socket.on("playerData", (playerData: PlayerData) => {
    console.log("room store player data: ", playerData);
    set((state) => ({
      players: {
        ...state.players,
        [playerData.clientId]: playerData,
      },
    }));
  });
  // console.log(clientId);

  return {
    ...initialState,

    joinRoom: (roomId) => {
      console.log("room store, join room:", roomId);
      set({ roomId });
      if (socket.connected) {
        console.log("socket connected");
        socket.emit("joinRoom", roomId);
      } else {
        console.log("socket not connected yet");
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
