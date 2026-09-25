import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Socket } from 'socket.io';

import type {
  Player,
  Game,
  PlayerRole,
  PlayerPosition,
  Movement,
  GridSize,
} from '@hide-and-seek/shared';

import type { GameEndReason } from './game.type.js';

const MIN_GAME_DURATION = 5;
const MAX_GAME_DURATION = 60;
const GAME_DURATION = 30;
const GRID_ROWS: GridSize = 10;
const GRID_COLUMNS: GridSize = 10;

@Injectable()
export class GameService {
  private readonly games = new Map<string, Game>();
  private waitingRoom: string | null = null;

  async addPlayer(client: Socket): Promise<string> {
    let roomId: string;

    if (this.waitingRoom === null) {
      roomId = randomUUID();
      this.waitingRoom = roomId;

      console.log('Nobody waiting. Created room:', roomId);
    } else {
      roomId = this.waitingRoom;
      this.waitingRoom = null;

      console.log('Joining waiting room:', roomId);
    }

    await client.join(roomId);

    const room = client.nsp.adapter.rooms.get(roomId);

    if (room?.size === 2) {
      this.startGame(client, roomId);
    }

    return roomId;
  }

  removePlayer(client: Socket) {
    const roomId = [...client.rooms].find((room) => room !== client.id);

    if (!roomId) {
      return;
    }

    const room = client.nsp.adapter.rooms.get(roomId);

    if (!room || room.size === 0) {
      this.games.delete(roomId);

      if (this.waitingRoom === roomId) {
        this.waitingRoom = null;
      }

      return;
    }

    if (room.size === 1) {
      const remainingClientId = [...room][0];

      this.games.delete(roomId);
      this.waitingRoom = roomId;

      console.log(
        `Player ${remainingClientId} is now waiting in room ${roomId}`,
      );
    }
  }

  movePlayer(client: Socket, movement: Movement) {
    const roomId = [...client.rooms].find((room) => room !== client.id);

    if (!roomId) {
      return;
    }
    const game = this.games.get(roomId);
    const room = client.nsp.adapter.rooms.get(roomId);

    if (!room || room.size !== 2) {
      return;
    }

    if (!game || game.status !== 'running') {
      return;
    }

    const player = game.players[client.id];

    if (!player) {
      return;
    }

    const currentPosition = player.position;

    const newPosition: PlayerPosition = {
      ...currentPosition,
    };

    switch (movement) {
      case 'up':
        if (newPosition.y > 0) {
          newPosition.y--;
        }
        break;

      case 'down':
        if (newPosition.y < game.columns - 1) {
          newPosition.y++;
        }
        break;

      case 'left':
        if (newPosition.x > 0) {
          newPosition.x--;
        }
        break;

      case 'right':
        if (newPosition.x < game.rows - 1) {
          newPosition.x++;
        }
        break;

      default:
        return;
    }

    const playerMoved =
      newPosition.x !== currentPosition.x ||
      newPosition.y !== currentPosition.y;

    if (!playerMoved) {
      return;
    }

    const updatedPlayer: Player = {
      ...player,
      position: newPosition,
    };

    const updatedGame: Game = {
      ...game,
      players: {
        ...game.players,
        [client.id]: updatedPlayer,
      },
    };

    this.games.set(roomId, updatedGame);

    client.nsp.to(roomId).emit('playerAction', {
      clientId: client.id,
      position: newPosition,
    });

    const opponentId = [...room].find((id) => id !== client.id);

    if (!opponentId) {
      return;
    }

    const opponent = updatedGame.players[opponentId];

    if (!opponent) {
      return;
    }

    const samePosition =
      newPosition.x === opponent.position.x &&
      newPosition.y === opponent.position.y;

    if (samePosition) {
      this.endGame(client, roomId, 'caught');
    }
  }

  private startGame(client: Socket, roomId: string) {
    const room = client.nsp.adapter.rooms.get(roomId);

    if (!room || room.size !== 2) {
      return;
    }

    const rows = GRID_ROWS;
    const columns = GRID_COLUMNS;
    const duration = Math.min(
      Math.max(GAME_DURATION, MIN_GAME_DURATION),
      MAX_GAME_DURATION,
    );

    const [player1Id, player2Id] = [...room];

    const corners: PlayerPosition[] = [
      { x: 0, y: 0 }, // top-left
      { x: 0, y: columns - 1 }, // top-right
      { x: rows - 1, y: 0 }, // bottom-left
      { x: rows - 1, y: columns - 1 }, // bottom-right
    ];

    const seekerPosition = corners[Math.floor(Math.random() * corners.length)];

    const hiderPosition = {
      x: rows - 1 - seekerPosition.x,
      y: columns - 1 - seekerPosition.y,
    };
    const player1IsSeeker = Math.random() < 0.5;

    const seekerId = player1IsSeeker ? player1Id : player2Id;
    const hiderId = player1IsSeeker ? player2Id : player1Id;

    const seeker: Player = {
      clientId: seekerId,
      role: 'seeker',
      position: seekerPosition,
    };

    const hider: Player = {
      clientId: hiderId,
      role: 'hider',
      position: hiderPosition,
    };

    const game: Game = {
      duration,
      status: 'running',
      rows,
      columns,
      players: {
        [seekerId]: seeker,
        [hiderId]: hider,
      },
    };

    this.games.set(roomId, game);

    client.nsp.to(roomId).emit('gameData', game);

    this.startGameTimer(client, roomId);
  }

  private endGame(client: Socket, roomId: string, reason: GameEndReason) {
    const game = this.games.get(roomId);

    if (!game || game.status !== 'running') {
      return;
    }

    const winner: PlayerRole = reason === 'caught' ? 'seeker' : 'hider';

    const finishedGame: Game = {
      ...game,
      duration: 0,
      status: 'finished',
      winner,
    };

    this.games.set(roomId, finishedGame);

    client.nsp.to(roomId).emit('gameData', finishedGame);

    client.nsp.to(roomId).emit('gameEnd', {
      reason,
      winner,
    });
  }

  private startGameTimer(client: Socket, roomId: string) {
    const interval = setInterval(() => {
      const game = this.games.get(roomId);

      if (!game || game.status !== 'running') {
        clearInterval(interval);
        return;
      }

      const duration = game.duration - 1;

      if (duration <= 0) {
        clearInterval(interval);
        this.endGame(client, roomId, 'timeout');
        return;
      }

      const updatedGame: Game = {
        ...game,
        duration,
      };

      this.games.set(roomId, updatedGame);

      client.nsp.to(roomId).emit('gameData', updatedGame);
    }, 1000);
  }
}
