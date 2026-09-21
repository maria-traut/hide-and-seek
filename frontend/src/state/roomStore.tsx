import { create } from "zustand";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", { autoConnect: false });

type RoomState = {
  results: Record<string, number>;
  connected: boolean;
  roomId: string | null;
  status: "empty" | "waiting" | "full";
  players: string[];
  joinRoom: (roomId: string) => void;
  //   action: (option: string) => void;
};

export const useRoomStore = create<RoomState>()((set, get) => {
  socket.on("connect", () => {
    set({ connected: true });

    const { roomId } = get();
    console.log("use store room id", roomId);
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

    // action: (option) => socket.emit("action", { roomId: get().roomId, option }),
  };
});
