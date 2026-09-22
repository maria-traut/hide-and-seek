import { useEffect, useState } from "react";
import { useRoomStore } from "../state/roomStore";
import { socket } from "../socket";
import GameGrid from "./GameGrid";

type PlayerRole = "seeker" | "hider";

type Position = {
  x: number;
  y: number;
};

type ClientState = {
  role: PlayerRole;
  clientId: string;
  position: Position;
  roomId: string;
  opponentPosition: Position;
};

export type PlayerData = {
  role: PlayerRole;
  clientId: string;
  position: Position;
  roomId: string;
  opponentPosition: Position;
};

export function Room({ roomId }: { roomId: string }) {
  const results = useRoomStore((s) => s.results);
  const connected = useRoomStore((s) => s.connected);
  const joinRoom = useRoomStore((s) => s.joinRoom);
  const updateResults = useRoomStore((s) => s.updateResults);
  //   const action = useRoomStore((s) => s.action);
  const [clientStates, setClientStates] = useState(
    new Map<string, ClientState>(),
  );

  useEffect(() => {
    updateResults({ test: 4 });
    joinRoom(roomId);

    socket.on("playerData", (roleData: PlayerData) => {
      const { role, clientId, position, opponentPosition } = roleData;
      console.log(`you are ${role}`);

      setClientStates((prev) => {
        const next = new Map(prev);

        next.set(clientId, {
          role,
          clientId,
          position,
          roomId,
          opponentPosition,
        });

        return next;
      });
    });
  }, [updateResults, connected, roomId, joinRoom]);

  const playerData = clientStates.values().next().value;
  console.log("client states values", clientStates.values().next().value);
  console.log("client states", clientStates);
  return (
    <div>
      <span>{connected ? "Live" : "Reconnecting..."}</span>
      {/* <button onClick={() => action("pomodoro")}>Pomodoro</button> */}
      <pre>{JSON.stringify(results, null, 2)}</pre>
      {Array.from(clientStates.entries()).length
        ? Array.from(clientStates.entries()).map(([clientId, state]) => (
            <div key={clientId}>
              <section>
                Client: {clientId} — Room: {state.roomId} — Role: {state.role}
              </section>
              <GameGrid playerData={playerData} />
            </div>
          ))
        : "Waiting..."}
      {}
    </div>
  );
}

// const [key, value] = map.entries().next().value;

// console.log(key);   // "foo"
// console.log(value); // 10
