import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Socket } from 'socket.io';

type Role = 'seeker' | 'hider';

type Player = {
  roomId: string;
  role?: Role;
};

@Injectable()
export class GameService {
  private readonly players = new Map<string, Player>();

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

  private startGame(client: Socket, roomId: string) {
    const room = client.nsp.adapter.rooms.get(roomId);

    if (!room || room.size !== 2) {
      return;
    }
    console.log('startGame', room);
    const [seekerId, hiderId] = [...room];

    this.players.set(seekerId, {
      roomId,
      role: 'seeker',
    });

    this.players.set(hiderId, {
      roomId,
      role: 'hider',
    });

    client.nsp.to(seekerId).emit('role', { role: 'seeker', clientId: seekerId });
    client.nsp.to(hiderId).emit('role', { role: 'hider', clientId: hiderId });

    // nsp.to(roomId).emit('game-start');
  }
}
