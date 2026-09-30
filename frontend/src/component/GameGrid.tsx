import { GRID_SIZE_CLASSES } from '@hide-and-seek/shared';
import type { GridSize, Player } from '@hide-and-seek/shared';

type GameGridProps = {
  players: Player[];
  rows: GridSize;
  columns: GridSize;
};

export default function GameGrid({ players, rows, columns }: GameGridProps) {
  const getPlayerAtPosition = (row: number, column: number) => {
    return players.find(
      (player) => player.position.x === row && player.position.y === column,
    );
  };

  return (
    <div>
      <div
        id="game-grid"
        className={`grid ${GRID_SIZE_CLASSES[columns]} gap-1`}
      >
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="row">
            {Array.from({ length: columns }, (_, column) => {
              const player = getPlayerAtPosition(row, column);

              const color =
                player?.role === 'hider'
                  ? 'bg-green-400 dark:bg-green-600'
                  : player?.role === 'seeker'
                    ? 'bg-red-400 dark:bg-red-600'
                    : '';

              return (
                <div
                  key={`${row}-${column}`}
                  className={`cell aspect-square border ${color}`}
                >
                  <span>
                    x: {row}
                    <br />
                    y: {column}
                  </span>
                </div>
              );
            })}
            ,
          </div>
        ))}
      </div>
    </div>
  );
}
