import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
// import { Server } from 'socket.io';
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
    // console.log('addPlayer', client);
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

    // const room = client.adapter.rooms.get(roomId);
    const room = client.nsp.adapter.rooms.get(roomId);

    if (room?.size === 2) {
      this.startGame(client.nsp, roomId);
    }
  }

  removePlayer(client: Socket) {
    const player = this.players.get(client.id);

    if (!player) {
      return;
    }

    const roomId = player.roomId;

    // Remove from our own player map
    this.players.delete(client.id);

    // Socket.IO has already removed the socket from its rooms
    const room = client.nsp.adapter.rooms.get(roomId);

    if (!room || room.size === 0) {
      // Room is completely empty.
      // Socket.IO will remove it automatically.
      console.log(`Room ${roomId} is empty`);

      if (this.waitingRoom === roomId) {
        this.waitingRoom = null;
      }

      return;
    }

    // One player remains.
    if (room.size === 1) {
      const remainingSocketId = [...room][0];

      // The old match is no longer valid.
      // Make the remaining player wait for a new match.
      this.players.set(remainingSocketId, {
        roomId,
      });

      this.waitingRoom = roomId;

      console.log(
        `Player ${remainingSocketId} is now waiting in room ${roomId}`,
      );
    }
  }

  private startGame(nsp: Socket['nsp'], roomId: string) {
    const room = nsp.adapter.rooms.get(roomId);

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

    nsp.to(seekerId).emit('role', { role: 'seeker', clientId: seekerId });
    nsp.to(hiderId).emit('role', { role: 'hider', clientId: hiderId });

    // nsp.to(roomId).emit('game-start');
  }
}
