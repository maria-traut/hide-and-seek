import { useEffect } from "react";
import "./App.css";
import { socket } from "./socket";

function App() {
  useEffect(() => {
    socket.connect();
    socket.emit("clientConnect", "hello server");
    socket.on("responseFromServer", (textFromServer: string) => {
      console.log(textFromServer);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Hide and Seek</h1>
    </div>
  );
}

export default App;
