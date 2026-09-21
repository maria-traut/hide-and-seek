import { useEffect, useState } from "react";
import "./App.css";
import { socket } from "./socket";
import { Room } from "./component/Room";

function App() {
  const roomId = "room1";
  const [clientId, setClientId] = useState(" ");
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
    socket.on("clientId", (clientId: string) => {
      setClientId(clientId);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>🍅 Hide and Seek 🍅</h1>
      <h2>{clientId}</h2>
      <Room roomId={roomId} />
    </div>
  );
}

export default App;
