import { Module } from '@nestjs/common';
import { NotificationsWebSocketGateway } from './websocket.gateway';
import { NotificationsModule } from '../notifications/notifications.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '../config/jwt.config';

@Module({
  imports: [
    NotificationsModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: {
        expiresIn: (Number(jwtConfig.expiresIn) || jwtConfig.expiresIn) as any,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      },
      verifyOptions: {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      },
    }),
  ],
  providers: [NotificationsWebSocketGateway],
  exports: [NotificationsWebSocketGateway],
})
export class WebSocketModule {}
