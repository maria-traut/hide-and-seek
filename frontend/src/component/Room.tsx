import { useEffect } from "react";
import { useRoomStore } from "../state/roomStore";

export function Room({ roomId }: { roomId: string }) {
  const results = useRoomStore((s) => s.results);
  const connected = useRoomStore((s) => s.connected);
  const joinRoom = useRoomStore((s) => s.joinRoom);
  //   const action = useRoomStore((s) => s.action);

  useEffect(() => {
    joinRoom(roomId);
    console.log("room use effect");
  }, [roomId, joinRoom]);

  return (
    <div>
      <span>{connected ? "Live" : "Reconnecting..."}</span>
      {/* <button onClick={() => action("pomodoro")}>Pomodoro</button> */}
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}
