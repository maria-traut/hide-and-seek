import type { PlayerData } from "./Room";
import { Fragment } from "react/jsx-runtime";

export default function GameGrid({
  playerData,
  rows,
  columns,
}: {
  playerData: PlayerData | undefined;
  rows: number;
  columns: number;
}) {
  if (!playerData) return;
  const { position, opponentPosition, role } = playerData;
  console.log("position", position);
  // const rows = 10;
  // const columns = 10;
  const color = role === "hider" ? "bg-green-500" : "bg-red-500";
  const opponentColor = role === "hider" ? "bg-red-500" : "bg-green-500";

  const gridCols: Record<number, string> = {
    5: "grid-cols-5",
    10: "grid-cols-10",
    15: "grid-cols-15",
    20: "grid-cols-20",
  };
  return (
    <>
      <span>{position.x}</span>
      <span>{position.y}</span>
      <div id="game-grid" className={`grid ${gridCols[columns]} gap-1`}>
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="row">
            {Array.from({ length: columns }, (_, column) => (
              <Fragment key={column}>
                <div
                  className={`cell aspect-square border ${
                    position && position.x === row && position.y === column
                      ? color
                      : ""
                  } ${
                    opponentPosition &&
                    opponentPosition.x === row &&
                    opponentPosition.y === column
                      ? opponentColor
                      : ""
                  }`}
                >
                  x: {row} <br />
                  y: {column}
                </div>
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
