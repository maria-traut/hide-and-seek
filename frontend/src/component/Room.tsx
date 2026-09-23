import { useEffect } from "react";
import { useRoomStore } from "../state/roomStore";
import { socket } from "../socket";
import GameGrid from "./GameGrid";

export type PlayerRole = "seeker" | "hider";

type Position = {
  x: number;
  y: number;
};

export type PlayerData = {
  role: PlayerRole;
  clientId: string;
  position: Position;
  roomId: string;
  opponentPosition: Position;
};

export type GameData = {
  duration: number;
  startTime?: number;
  status: "running" | "finished" | "waiting";
  rows: number;
  columns: number;
};

export function Room({
  roomId,
  clientId,
}: {
  roomId: string;
  clientId: string;
}) {
  // const results = useRoomStore((s) => s.results);
  const connected = useRoomStore((s) => s.connected);
  const joinRoom = useRoomStore((s) => s.joinRoom);
  const updateResults = useRoomStore((s) => s.updateResults);
  const duration = useRoomStore((s) => s.duration);
  const players = useRoomStore((s) => s.players);
  const player = useRoomStore((s) => s.players[clientId]);
  const status = useRoomStore((s) => s.status);
  const action = useRoomStore((s) => s.action);
  const rows = useRoomStore((s) => s.rows);
  const columns = useRoomStore((s) => s.columns);

  console.log("room.tsx players", players);
  console.log("room.tsx player", player);
  useEffect(() => {
    updateResults({ test: 4 });
    joinRoom(roomId);
    socket.on("game-start", () => {
      console.log("game-start");
    });
  }, [updateResults, connected, roomId, joinRoom]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
      ) {
        const command =
          event.key === "ArrowUp"
            ? "up"
            : event.key === "ArrowDown"
              ? "down"
              : event.key === "ArrowLeft"
                ? "left"
                : event.key === "ArrowRight"
                  ? "right"
                  : undefined;
        socket.emit("action", {
          roomId,
          movement: command,
        });
      }
    }

    window.addEventListener("keydown", handleKeydown);
  }, [action, roomId]);

  return (
    <div>
      <h3 className="text-2xl text-red-400 dark:text-red-100">
        Game Status: {connected ? "Live" : "Reconnecting..."}
      </h3>
      <ul>
        <li>Duration: {duration}</li>
        <li>Status: {status}</li>
      </ul>
      {/* <button onClick={() => action("pomodoro")}>Pomodoro</button> */}
      {Object.entries(players).length > 0
        ? Object.entries(players).map(([clientId, state]) => (
            <div key={clientId}>
              <section className="my-3 flex items-center justify-between">
                <div>🍝 Client: {clientId}</div>
                <div>🫒 Room: {state.roomId}</div>
                <div>🍋 Role: {state.role}</div>
              </section>

              <GameGrid playerData={state} rows={rows} columns={columns} />
            </div>
          ))
        : "Waiting..."}
    </div>
  );
}
