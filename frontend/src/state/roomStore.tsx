import { create } from "zustand";
import { socket } from "../socket";

type RoomState = {
  results: Record<string, number>;
  connected: boolean;
  roomId: string | null;
  status: "empty" | "waiting" | "full";
  players: Record<string, number>;
  joinRoom: (roomId: string) => void;
  // action: (option: string) => void;
};

type Action = {
  updateResults: (results: RoomState["results"]) => void;
};

export const useRoomStore = create<RoomState & Action>()((set, get) => {
  socket.on("connect", () => {
    set({ connected: true });

    const { roomId, role } = get();
    const allGet = get();
    console.log("all get", allGet);
    console.log("use store room id", roomId);
    console.log("use store role", role);
    if (roomId) socket.emit("joinRoom", roomId);
  });
  socket.on("disconnect", () => set({ connected: false }));
  socket.on("results", (results: Record<string, number>) => set({ results }));

  return {
    results: {},
    connected: false,
    roomId: null,
    status: "empty",
    players: [],

    joinRoom: (roomId) => {
      console.log(`room store join room ${roomId}`);
      set({ roomId });
      console.log("get", get());
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
    // action: (option) => socket.emit("action", { roomId: get().roomId, option }),
  };
});
