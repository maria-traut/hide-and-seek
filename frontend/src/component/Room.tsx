import { useEffect, useState } from "react";
import { useRoomStore } from "../state/roomStore";
import { socket } from "../socket";

type PlayerRole = "seeker" | "hider";

type ClientState = {
  roomId: string;
  role: PlayerRole;
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
	
    socket.on("role", (roleData: { role: PlayerRole; clientId: string }) => {
      const { clientId, role } = roleData;
      console.log(`you are ${role}`);

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
