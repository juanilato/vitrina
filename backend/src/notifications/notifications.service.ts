import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Crear una nueva notificación
  async create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notificacion.create({
      data: createNotificationDto,
    });
  }

  // Obtener notificaciones de un usuario
  async findByUser(userId: string, userType: string, limit: number = 50) {
    return this.prisma.notificacion.findMany({
      where: {
        userId,
        userType,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  // Obtener notificaciones no leídas
  async findUnreadByUser(userId: string, userType: string) {
    return this.prisma.notificacion.findMany({
      where: {
        userId,
        userType,
        leida: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Contar notificaciones no leídas
  async countUnreadByUser(userId: string, userType: string) {
    return this.prisma.notificacion.count({
      where: {
        userId,
        userType,
        leida: false,
      },
    });
  }

  // Marcar notificación como leída
  async markAsRead(id: string, userId: string, userType: string) {
    return this.prisma.notificacion.updateMany({
      where: {
        id,
        userId,
        userType,
      },
      data: {
        leida: true,
        leidaAt: new Date(),
      },
    });
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId: string, userType: string) {
    return this.prisma.notificacion.updateMany({
      where: {
        userId,
        userType,
        leida: false,
      },
      data: {
        leida: true,
        leidaAt: new Date(),
      },
    });
  }

  // Eliminar notificación
  async remove(id: string, userId: string, userType: string) {
    return this.prisma.notificacion.deleteMany({
      where: {
        id,
        userId,
        userType,
      },
    });
  }

  // Crear notificación de pedido creado
  async createOrderNotification(
    pedidoId: string,
    clienteId: string,
    empresaId: string,
    clienteName: string,
    empresaName: string,
    totalAmount: number
  ) {
    // Notificación para la empresa
    const empresaNotification = await this.create({
      userId: empresaId,
      userType: 'empresa',
      titulo: 'Nuevo Pedido Recibido',
      mensaje: `${clienteName} ha realizado un pedido por $${totalAmount.toLocaleString('es-AR')}`,
      tipo: 'pedido_creado',
      metadata: {
        pedidoId,
        clienteId,
        clienteName,
        totalAmount,
      },
    });

    // Notificación para el cliente
    const clienteNotification = await this.create({
      userId: clienteId,
      userType: 'cliente',
      titulo: 'Pedido Confirmado',
      mensaje: `Tu pedido a ${empresaName} ha sido recibido y está siendo procesado`,
      tipo: 'pedido_creado',
      metadata: {
        pedidoId,
        empresaId,
        empresaName,
        totalAmount,
      },
    });

    return {
      empresa: empresaNotification,
      cliente: clienteNotification,
    };
  }

  // Crear notificación de cambio de estado de pedido
  async createOrderStatusNotification(
    pedidoId: string,
    clienteId: string,
    empresaId: string,
    clienteName: string,
    empresaName: string,
    oldStatus: string,
    newStatus: string,
    totalAmount: number
  ) {
    const statusMessages = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'preparando': 'En Preparación',
      'listo': 'Listo para Retirar',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado',
    };

    const statusMessage = statusMessages[newStatus] || newStatus;

    // Notificación para el cliente
    const clienteNotification = await this.create({
      userId: clienteId,
      userType: 'cliente',
      titulo: 'Estado de Pedido Actualizado',
      mensaje: `Tu pedido a ${empresaName} cambió de estado a: ${statusMessage}`,
      tipo: 'pedido_actualizado',
      metadata: {
        pedidoId,
        empresaId,
        empresaName,
        oldStatus,
        newStatus,
        totalAmount,
      },
    });

    return clienteNotification;
  }
}
