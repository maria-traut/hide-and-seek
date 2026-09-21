import { useEffect, useState } from "react";
import { useRoomStore } from "../state/roomStore";
import { socket } from "../socket";

export function Room({ roomId }: { roomId: string }) {
  const [clientId, setClientId] = useState(" ");
  const results = useRoomStore((s) => s.results);
  const connected = useRoomStore((s) => s.connected);
  const joinRoom = useRoomStore((s) => s.joinRoom);
  const players = useRoomStore((s) => s.players);
  //   const action = useRoomStore((s) => s.action);

  useEffect(() => {
    joinRoom(roomId);
    console.log("room use effect");
    console.log("room.tsx connected", connected);
    socket.on("clientId", (clientId: string) => {
      setClientId(clientId);
      socket.emit();
      console.log("room.tsx client id", clientId);
    });
  }, [roomId, joinRoom]);

  return (
    <div>
      <span>{connected ? "Live" : "Reconnecting..."}</span>
      {/* <button onClick={() => action("pomodoro")}>Pomodoro</button> */}
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}
