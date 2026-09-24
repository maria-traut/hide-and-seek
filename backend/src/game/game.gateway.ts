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
import { Movement } from './game.type';

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
    const roomId = await this.gameService.addPlayer(client);

    client.emit('clientId', client.id);
    client.emit('roomAssigned', roomId);
  }

  handleDisconnect(client: Socket) {
    this.gameService.removePlayer(client);
  }

  @SubscribeMessage('action')
  handleClientAction(
    @MessageBody() actionData: { movement: Movement },
    @ConnectedSocket() client: Socket,
  ) {
    this.gameService.movePlayer(client, actionData.movement);
  }
}
