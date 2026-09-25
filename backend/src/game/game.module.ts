import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway.js';
import { GameService } from './game.service.js';

@Module({
  providers: [GameGateway, GameService],
})
export class GameModule {}
