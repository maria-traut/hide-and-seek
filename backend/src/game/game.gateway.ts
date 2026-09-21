import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.gameService.addPlayer(client);
  }

  handleDisconnect(client: Socket) {
    console.log(`client disconnected: ${client.id}`);
    this.gameService.removePlayer(client);
  }

  @SubscribeMessage('clientConnect')
  handleClientConnect(
    @MessageBody() textFromClient: string,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(textFromClient);
    socket.emit('responseFromServer', 'hello client');
  }

  // @SubscribeMessage('joinRoom')
  // handleJoin(@MessageBody() roomId: string, @ConnectedSocket() socket: Socket) {
  //   void socket.join(roomId);
  //   void this.gameService.getSockets(roomId, this.server);
  //   void this.gameService.addPlayer(socket.id);

  //   console.log(`${socket.id} joined room ${roomId}`);
  //   socket.emit('clientId', socket.id);
  // }
}
