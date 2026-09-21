import { useEffect, useState } from "react";
import { useRoomStore } from "../state/roomStore";
import { socket } from "../socket";

type PlayerRole = "seeker" | "hider";

type ClientState = {
  roomId: string;
  role: PlayerRole;
};

const clientState = new Map<string, ClientState>();

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
    console.log("room use effect");
    console.log("room.tsx connected", connected);
    socket.on("clientId", (clientId: string) => {
      // socket.emit();
      console.log("room.tsx client id", clientId);
    });
    socket.on("role", (roleData: { role: PlayerRole; clientId: string }) => {
      const { clientId, role } = roleData;
      console.log(`you are ${role}`);
      // clientState.set(clientId, { roomId, role });
      setClientStates((prev) => {
        const next = new Map(prev);

        next.set(clientId, {
          roomId,
          role,
        });

        return next;
      });
    });
  }, [updateResults, connected, roomId, joinRoom]);

  return (
    <div>
      <span>{connected ? "Live" : "Reconnecting..."}</span>
      {/* <button onClick={() => action("pomodoro")}>Pomodoro</button> */}
      <pre>{JSON.stringify(results, null, 2)}</pre>
      {Array.from(clientStates.entries()).length
        ? Array.from(clientStates.entries()).map(([clientId, state]) => (
            <div key={clientId}>
              Client: {clientId} — Room: {state.roomId} — Role: {state.role}
            </div>
          ))
        : "Waiting..."}
      {}
    </div>
  );
}
