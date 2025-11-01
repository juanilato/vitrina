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
    origin: true, // Permitir todos los orígenes en desarrollo
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
    console.log(`📤 Intentando enviar notificación al usuario: ${userId}`);
    console.log(`📋 Notificación:`, notification);

    const socketId = this.connectedUsers.get(userId);
    console.log(`🔌 Usuario ${userId} conectado:`, socketId ? 'SÍ' : 'NO');
    console.log(`👥 Usuarios conectados:`, Array.from(this.connectedUsers.keys()));

    if (socketId) {
      this.server.to(socketId).emit('new-notification', notification);
      this.server.to(`notifications-${userId}`).emit('new-notification', notification);
      console.log(`✅ Notificación enviada a socket ${socketId} y room notifications-${userId}`);
    } else {
      console.log(`⚠️ Usuario ${userId} no conectado, notificación guardada en BD pero no enviada por WebSocket`);
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

  // Método para enviar nueva solicitud de vinculación al repartidor
  async sendNuevaSolicitudVinculacion(repartidorId: string, data: any) {
    console.log(`📤 [WS] Enviando nueva solicitud de vinculación al repartidor: ${repartidorId}`);
    const socketId = this.connectedUsers.get(repartidorId);
    if (socketId) {
      this.server.to(socketId).emit('nueva_solicitud_vinculacion', data);
      console.log(`✅ [WS] Solicitud de vinculación enviada`);
    } else {
      console.log(`⚠️ [WS] Repartidor ${repartidorId} no conectado`);
    }
  }

  // Método para enviar actualización de vinculación a la empresa
  async sendVinculacionActualizada(empresaId: string, data: any) {
    console.log(`📤 [WS] Enviando actualización de vinculación a empresa: ${empresaId}`);
    const socketId = this.connectedUsers.get(empresaId);
    if (socketId) {
      this.server.to(socketId).emit('vinculacion_actualizada', data);
      console.log(`✅ [WS] Actualización de vinculación enviada`);
    } else {
      console.log(`⚠️ [WS] Empresa ${empresaId} no conectada`);
    }
  }

  // Método para enviar pedido asignado al repartidor (no puede rechazarlo)
  async sendPedidoAsignadoARepartidor(repartidorId: string, data: any) {
    console.log(`📤 [WS] Enviando pedido asignado al repartidor: ${repartidorId}`);
    console.log(`📋 [WS] Datos del pedido:`, data);

    const socketId = this.connectedUsers.get(repartidorId);
    if (socketId) {
      // Evento global que el repartidor debe escuchar obligatoriamente
      this.server.to(socketId).emit('pedido_asignado', data);
      console.log(`✅ [WS] Pedido asignado enviado al repartidor`);
    } else {
      console.log(`⚠️ [WS] Repartidor ${repartidorId} no conectado, pedido guardado en BD`);
    }
  }

  // Handler para cuando el repartidor actualiza su ubicación
  @SubscribeMessage('actualizar_ubicacion_repartidor')
  async handleActualizarUbicacionRepartidor(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { pedidoId: string; latitud: number; longitud: number },
  ) {
    console.log(`📍 [WS] Repartidor ${client.userId} actualizó ubicación para pedido ${data.pedidoId}`);

    // Emitir a todos los clientes y empresas interesadas en este pedido
    this.server.emit('ubicacion_repartidor_actualizada', {
      pedidoId: data.pedidoId,
      latitud: data.latitud,
      longitud: data.longitud,
    });
  }

  // Método para enviar actualización de ubicación del repartidor al cliente y empresa
  async sendUbicacionRepartidorUpdate(clienteId: string, empresaId: string, data: any) {
    console.log(`📍 [WS] Enviando actualización de ubicación del repartidor`);
    console.log(`👤 Cliente: ${clienteId}, 🏢 Empresa: ${empresaId}`);

    // Enviar al cliente
    const clienteSocketId = this.connectedUsers.get(clienteId);
    if (clienteSocketId) {
      this.server.to(clienteSocketId).emit('ubicacion_repartidor_actualizada', data);
      console.log(`✅ [WS] Ubicación enviada al cliente ${clienteId}`);
    } else {
      console.log(`⚠️ [WS] Cliente ${clienteId} no conectado`);
    }

    // Enviar a la empresa
    const empresaSocketId = this.connectedUsers.get(empresaId);
    if (empresaSocketId) {
      this.server.to(empresaSocketId).emit('ubicacion_repartidor_actualizada', data);
      console.log(`✅ [WS] Ubicación enviada a la empresa ${empresaId}`);
    } else {
      console.log(`⚠️ [WS] Empresa ${empresaId} no conectada`);
    }
  }
}
