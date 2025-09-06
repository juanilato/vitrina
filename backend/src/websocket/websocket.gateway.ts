import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../notifications/notifications.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userType?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      console.log('🔌 Nueva conexión WebSocket recibida');
      console.log('📋 Headers:', client.handshake.headers);
      console.log('🔑 Auth:', client.handshake.auth);
      
      const token = client.handshake.auth?.token || 
                   client.handshake.headers?.authorization?.replace('Bearer ', '') ||
                   client.handshake.query?.token;
      
      console.log('🎫 Token extraído:', token ? 'Presente' : 'No encontrado');
      
      if (!token) {
        console.log('❌ No se encontró token, desconectando cliente');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      console.log('✅ Token verificado:', payload);
      
      client.userId = payload.sub; // El JWT usa 'sub' en lugar de 'id'
      client.userType = payload.type; // El JWT usa 'type' en lugar de 'userType'

      // Guardar la conexión del usuario
      this.connectedUsers.set(payload.sub, client.id);

      console.log(`✅ Usuario conectado: ${payload.sub} (${payload.type})`);
    } catch (error) {
      console.error('❌ Error de autenticación WebSocket:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      console.log(`Usuario desconectado: ${client.userId}`);
    }
  }

  @SubscribeMessage('join-notifications')
  handleJoinNotifications(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.userId) {
      client.join(`notifications-${client.userId}`);
      console.log(`Usuario ${client.userId} se unió a las notificaciones`);
    }
  }

  @SubscribeMessage('mark-notification-read')
  async handleMarkNotificationRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: string },
  ) {
    if (!client.userId || !client.userType) return;

    try {
      await this.notificationsService.markAsRead(
        data.notificationId,
        client.userId,
        client.userType,
      );

      // Enviar confirmación al cliente
      client.emit('notification-marked-read', { notificationId: data.notificationId });
    } catch (error) {
      client.emit('error', { message: 'Error al marcar notificación como leída' });
    }
  }

  // Método para enviar notificación a un usuario específico
  async sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('new-notification', notification);
      this.server.to(`notifications-${userId}`).emit('new-notification', notification);
    }
  }

  // Método para enviar notificación a todos los usuarios de un tipo
  async sendNotificationToUserType(userType: string, notification: any) {
    this.server.emit('new-notification', notification);
  }

  // Método para enviar actualización de contador de notificaciones
  async sendNotificationCountUpdate(userId: string, count: number) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification-count-update', { count });
      this.server.to(`notifications-${userId}`).emit('notification-count-update', { count });
    }
  }
}
