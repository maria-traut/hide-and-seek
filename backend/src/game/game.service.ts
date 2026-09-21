import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class GameService {
  async getSockets(roomId: string, server: Server): Promise<void> {
    console.log('game service getSockets', roomId);
    const sockets = await server.in(roomId).fetchSockets();

    for (const socket of sockets) {
      console.log('socket id', socket.id);
      console.log('socket handshake', socket.handshake);
      console.log('socket rooms', socket.rooms);

      //   console.log("socket data", socket.data);
    }
    const room = server.sockets.adapter.rooms.get(roomId);
    console.log('room', room);
  }
}
