import { Module } from '@nestjs/common';
import { NotificationsWebSocketGateway } from './websocket.gateway';
import { NotificationsModule } from '../notifications/notifications.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    NotificationsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'tu-super-secreto-jwt-aqui-cambiar-en-produccion',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [NotificationsWebSocketGateway],
  exports: [NotificationsWebSocketGateway],
})
export class WebSocketModule {}
