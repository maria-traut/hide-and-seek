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

  async handleConnection(client: Socket) {
    console.log('connected client', client.id);
    await this.gameService.addPlayer(client);
  }

  handleDisconnect(client: Socket) {
    console.log('disconnected client', client.id);
    this.gameService.removePlayer(client);
  }

  @SubscribeMessage('clientConnect')
  handleClientConnect(
    @MessageBody() textFromClient: string,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log('textFromClient', textFromClient);
    socket.emit('responseFromServer', 'hello client');
  }

  @SubscribeMessage('action')
  handleClientAction(
    @MessageBody()
    actionData: { roomId: string; movement: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(
      'Client Request Action',
      actionData.movement,
      actionData.roomId,
    );
    this.gameService.movePlayer(client, actionData.movement);
  }
}
