import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Socket } from 'socket.io';

type Role = 'seeker' | 'hider';

type Position = {
  x: number | undefined;
  y: number | undefined;
};

type Player = {
  roomId: string;
  role?: Role;
  position?: Position;
};

type Game = {
  duration: number;
  startTime?: number;
  status: 'running' | 'finished' | 'waiting';
  rows: number;
  columns: number;
};

@Injectable()
export class GameService {
  private readonly players = new Map<string, Player>();
  private readonly game = new Map<string, Game>();

  private waitingRoom: string | null = null;

  addPlayer(client: Socket) {
    let roomId: string;

    if (this.waitingRoom === null) {
      console.log('nobody waiting. you are the first.');
      roomId = randomUUID();
      this.waitingRoom = roomId;
    } else {
      console.log('waiting room content', this.waitingRoom);
      roomId = this.waitingRoom;
      this.waitingRoom = null;
    }

    void client.join(roomId);

    this.players.set(client.id, {
      roomId,
      position: { x: undefined, y: undefined },
    });

    const room = client.nsp.adapter.rooms.get(roomId);

    if (room?.size === 2) {
      this.startGame(client, roomId);
    }
  }

  removePlayer(client: Socket) {
    const player = this.players.get(client.id);

    if (!player) {
      return;
    }

    const roomId = player.roomId;

    this.players.delete(client.id);

    const room = client.nsp.adapter.rooms.get(roomId);

    if (!room || room.size === 0) {
      if (this.waitingRoom === roomId) {
        this.waitingRoom = null;
      }
      return;
    }

    if (room.size === 1) {
      const remainingClientId = [...room][0];
      this.players.set(remainingClientId, {
        roomId,
      });

      this.waitingRoom = roomId;

      console.log(
        `Player ${remainingClientId} is now waiting in room ${roomId}`,
      );
    }
  }

  movePlayer(client: Socket, movement: string) {
    const player = this.players.get(client.id);
    const currentPosition = player?.position;
    console.log('Service Movement', movement, currentPosition);
  }

  private async startGame(client: Socket, roomId: string) {
    const room = client.nsp.adapter.rooms.get(roomId);

    if (!room || room.size !== 2) {
      return;
    }
    console.log('startGame', room);
    const [seekerId, hiderId] = [...room];

    this.game.set(roomId, {
      duration: 30,
      startTime: new Date().getTime(),
      status: 'running',
      rows: 10,
      columns: 10,
    });

    this.players.set(seekerId, {
      roomId,
      role: 'seeker',
      position: { x: 0, y: 0 },
    });

    this.players.set(hiderId, {
      roomId,
      role: 'hider',
      position: { x: 9, y: 9 },
    });

    // client.nsp.to(roomId).emit('gameData', this.game.get(roomId));

    client.nsp.to(seekerId).emit('playerData', {
      role: 'seeker',
      clientId: seekerId,
      position: { x: 0, y: 0 },
      roomId: roomId,
      opponentPosition: { x: 9, y: 9 },
    });
    client.nsp.to(hiderId).emit('playerData', {
      role: 'hider',
      clientId: hiderId,
      position: { x: 9, y: 9 },
      roomId: roomId,
      opponentPosition: { x: 0, y: 0 },
    });

    await this.countDown(30, client, roomId, 10, 10);

    client.nsp.to(roomId).emit('game-start');
  }

  private async countDown(
    duration: number,
    client: Socket,
    roomId: string,
    rows: number,
    columns: number,
  ): Promise<void> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        this.game.set(roomId, { duration, status: 'running', rows, columns });
        console.log('countDown', duration);
        duration--;

        if (duration < 0) {
          clearInterval(interval);
          resolve();
        } else if (duration < 1) {
          this.game.set(roomId, {
            duration,
            status: 'finished',
            rows,
            columns,
          });
          client.nsp.to(roomId).emit('gameData', this.game.get(roomId));
        } else {
          client.nsp.to(roomId).emit('gameData', this.game.get(roomId));
        }
      }, 1000);
    });
  }
}
