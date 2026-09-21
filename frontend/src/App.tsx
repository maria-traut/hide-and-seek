import { useEffect } from "react";
import "./App.css";
import { socket } from "./socket";
import { Room } from "./component/Room";

function App() {
  const roomId = "room1";
  useEffect(() => {
    socket.connect();
    socket.emit("clientConnect", "hello server");
    socket.emit("joinRoom", roomId);
    socket.on("responseFromServer", (textFromServer: string) => {
      console.log(textFromServer);
    });
    socket.on("joinedRoom", (roomId: string) => {
      console.log(`joined room: ${roomId}`);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>🍅 Hide and Seek 🍅</h1>
      <Room roomId={roomId} />
    </div>
  );
}

export default App;
