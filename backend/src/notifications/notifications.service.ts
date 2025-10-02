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
    totalAmount: number,
    extras?: { deliveryLocation?: { direccion: string; lat: number; lng: number }; shippingPrice?: { price: number | null; isEstimated: boolean; message: string } }
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
        icono: '🛒',
        ...(extras?.deliveryLocation ? { deliveryLocation: extras.deliveryLocation } : {}),
        ...(extras?.shippingPrice ? { shippingPrice: extras.shippingPrice } : {}),
      },
    });

    // Notificación para el cliente
    const clienteNotification = await this.create({
      userId: clienteId,
      userType: 'cliente',
      titulo: 'Pedido Recibido',
      mensaje: `Tu pedido a ${empresaName} ha sido recibido y está pendiente de confirmación.`,
      tipo: 'pedido_creado',
      metadata: {
        pedidoId,
        empresaId,
        empresaName,
        totalAmount,
        icono: '📋',
        ...(extras?.deliveryLocation ? { deliveryLocation: extras.deliveryLocation } : {}),
        ...(extras?.shippingPrice ? { shippingPrice: extras.shippingPrice } : {}),
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
      'pendiente_confirmacion': {
        titulo: 'Pedido Recibido',
        mensaje: 'Tu pedido ha sido recibido y está pendiente de confirmación.',
        icono: '📋'
      },
      'confirmado': {
        titulo: 'Pedido Confirmado',
        mensaje: 'Tu pedido ha sido confirmado y será procesado pronto.',
        icono: '✅'
      },
      'en_proceso': {
        titulo: 'Pedido en Proceso',
        mensaje: 'Tu pedido está siendo preparado.',
        icono: '⚙️'
      },
      'esperando_delivery': {
        titulo: 'Esperando Delivery',
        mensaje: 'Tu pedido está listo, esperando delivery',
        icono: '🏍️'
      },
      'en_camino': {
        titulo: 'En Camino',
        mensaje: 'Tu pedido está en camino',
        icono: '📍'
      },
      'entregado': {
        titulo: 'Pedido Entregado',
        mensaje: '¡Tu pedido ha sido entregado exitosamente!',
        icono: '🎉'
      },
      'esperando_retiro': {
        titulo: 'Esperando Retiro',
        mensaje: 'Tu pedido está listo para ser retirado en el local.',
        icono: '🏪'
      },
      'no_confirmado': {
        titulo: 'Pedido No Confirmado',
        mensaje: 'Tu pedido no pudo ser confirmado.',
        icono: '❌'
      }
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages];
    if (!message) {
      // Fallback para estados no reconocidos
      const clienteNotification = await this.create({
        userId: clienteId,
        userType: 'cliente',
        titulo: 'Estado de Pedido Actualizado',
        mensaje: `Tu pedido a ${empresaName} cambió de estado a: ${newStatus}`,
        tipo: 'pedido_actualizado',
        metadata: {
          pedidoId,
          empresaId,
          empresaName,
          oldStatus,
          newStatus,
          totalAmount,
          icono: '📢',
        },
      });
      return clienteNotification;
    }

    // Notificación para el cliente con mensaje personalizado
    const clienteNotification = await this.create({
      userId: clienteId,
      userType: 'cliente',
      titulo: message.titulo,
      mensaje: message.mensaje,
      tipo: 'pedido_actualizado',
      metadata: {
        pedidoId,
        empresaId,
        empresaName,
        oldStatus,
        newStatus,
        totalAmount,
        icono: message.icono,
      },
    });

    return clienteNotification;
  }
}
