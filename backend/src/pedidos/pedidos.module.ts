import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { TempPhotoService } from './services/temp-photo.service';

@Module({
  imports: [PrismaModule, NotificationsModule, WebSocketModule],
  controllers: [PedidosController],
  providers: [PedidosService, TempPhotoService],
  exports: [PedidosService],
})
export class PedidosModule {}
