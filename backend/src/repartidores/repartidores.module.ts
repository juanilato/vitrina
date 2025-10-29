import { Module } from '@nestjs/common';
import { RepartidoresController } from './repartidores.controller';
import { RepartidoresService } from './repartidores.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [PrismaModule, WebSocketModule],
  controllers: [RepartidoresController],
  providers: [RepartidoresService],
  exports: [RepartidoresService],
})
export class RepartidoresModule {}

