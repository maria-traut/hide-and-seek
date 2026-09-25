import { useEffect } from 'react';
import './App.css';
import { Room } from './component/Room';
import { useRoomStore } from './store/room.store';
import { socket } from './socket';

function App() {
  const clientId = useRoomStore((s) => s.clientId);
  const roomId = useRoomStore((s) => s.roomId);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1 className="text-red-300 [text-shadow:0_0_3px_#f87171]">
        🍅 Hide and Seek 🍅
      </h1>

      <h2>Client: {clientId ?? 'Connecting...'}</h2>

      {!roomId ? <div>Looking for an opponent...</div> : <Room />}
    </div>
  );
}

export default App;
