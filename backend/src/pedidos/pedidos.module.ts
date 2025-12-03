import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { TempPhotoService } from './services/temp-photo.service';
import { DeliveryTimeEstimationService } from './services/delivery-time-estimation.service';
import { PromocionesModule } from '../promociones/promociones.module';

@Module({
  imports: [PrismaModule, NotificationsModule, WebSocketModule, PromocionesModule],
  controllers: [PedidosController],
  providers: [PedidosService, TempPhotoService, DeliveryTimeEstimationService],
  exports: [PedidosService, DeliveryTimeEstimationService],
})
export class PedidosModule { }
