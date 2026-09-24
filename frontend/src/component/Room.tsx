import { useEffect } from 'react';
import { useRoomStore } from '../store/room.store';
import GameGrid from './GameGrid';

export function Room() {
  const roomId = useRoomStore((s) => s.roomId);
  const clientId = useRoomStore((s) => s.clientId);
  const connected = useRoomStore((s) => s.connected);
  const game = useRoomStore((s) => s.game);
  const gameStatus = useRoomStore((s) => s.game?.status);
  const sendMovement = useRoomStore((s) => s.sendMovement);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      const movement =
        event.key === 'ArrowUp'
          ? 'up'
          : event.key === 'ArrowDown'
            ? 'down'
            : event.key === 'ArrowLeft'
              ? 'left'
              : event.key === 'ArrowRight'
                ? 'right'
                : null;

      if (movement && gameStatus === 'running') {
        sendMovement(movement);
      }
    }

    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [sendMovement, gameStatus]);

  if (!game) {
    return <div>Waiting...</div>;
  }

  const currentPlayer = clientId ? game.players[clientId] : undefined;

  const gameFinished = game.status === 'finished';

  const isWinner = gameFinished && currentPlayer?.role === game.winner;

  return (
    <div>
      <button
        onClick={() => window.location.reload()}
        className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-600"
      >
        Back to Lobby
      </button>
      <h3 className="text-2xl text-red-400 dark:text-red-100">
        Game Status: {connected ? 'Live' : 'Reconnecting...'}
      </h3>

      {gameFinished && game.winner && (
        <div>
          <h4 className="text-3xl my-5">
            {isWinner ? '🎉 You won!' : '😩 You lost!'}
          </h4>

          <p>Winner: {game.winner}</p>
        </div>
      )}

      <ul>
        {game.duration > 0 && <li>Time remaining: {game.duration}</li>}
        <li>Status: {game.status}</li>
        <li>Room: {roomId}</li>
      </ul>

      {Object.values(game.players).map((player) => (
        <section
          key={player.clientId}
          className="my-3 flex items-center justify-between"
        >
          <div>
            🍝 Client: {player.clientId}{' '}
            {clientId === player.clientId && (
              <span
                className={`font-bold ${
                  player.role === 'hider'
                    ? 'text-green-400 dark:text-green-600'
                    : 'text-red-400 dark:text-red-600'
                }`}
              >
                (YOU)
              </span>
            )}
          </div>
          <div>🍋 Role: {player.role}</div>
        </section>
      ))}

      <GameGrid
        players={Object.values(game.players)}
        rows={game.rows}
        columns={game.columns}
      />
    </div>
  );
}
