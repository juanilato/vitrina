import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePedidoDto, UpdatePedidoDto } from './dto';
import { PedidoWithItems } from './entities/pedido.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsWebSocketGateway } from '../websocket/websocket.gateway';
import { TempPhotoService } from './services/temp-photo.service';

@Injectable()
export class PedidosService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private webSocketGateway: NotificationsWebSocketGateway,
    private tempPhotoService: TempPhotoService,
  ) {}

  // crea pedido
  async create(createPedidoDto: CreatePedidoDto): Promise<PedidoWithItems> {
    try {
      // Verificar que la empresa existe
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: createPedidoDto.empresaId }
      });
      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }

      // Verificar que el cliente existe
      const cliente = await this.prisma.cliente.findUnique({
        where: { id: createPedidoDto.clienteId }
      });
      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      }

      // Verificar que todos los productos existen y pertenecen a la empresa
      const productIds = createPedidoDto.items.map(item => item.productoId);
      const productos = await this.prisma.productos.findMany({
        where: {
          id: { in: productIds },
          empresaId: createPedidoDto.empresaId,
          activo: true
        }
      });

      if (productos.length !== productIds.length) {
        throw new BadRequestException('Algunos productos no existen o no están activos');
      }

      // Manejar foto de transferencia si existe
      let transferenciaFotoFileName: string | null = null;
      
      if (createPedidoDto.transferenciaFoto && createPedidoDto.formaPago === 'transferencia') {
        transferenciaFotoFileName = await this.tempPhotoService.saveTempPhoto(
          'temp_' + Date.now(), // ID temporal, se actualizará después
          createPedidoDto.transferenciaFoto
        );
      }

      // Crear el pedido con sus items en una transacción
      const pedido = await this.prisma.$transaction(async (prisma) => {
        // Crear el pedido
        const newPedido = await prisma.pedido.create({
          data: {
            clienteId: createPedidoDto.clienteId,
            empresaId: createPedidoDto.empresaId,
            estado: 'pendiente_confirmacion',
            tipoEntrega: createPedidoDto.tipoEntrega,
            formaPago: createPedidoDto.formaPago,
          }
        });

        // Renombrar la foto con el ID real del pedido si existe
        if (transferenciaFotoFileName) {
          const fs = require('fs');
          const newFileName = transferenciaFotoFileName.replace('temp_', `transferencia_${newPedido.id}_`);
          const oldPath = this.tempPhotoService.getTempPhotoPath(transferenciaFotoFileName);
          const newPath = this.tempPhotoService.getTempPhotoPath(newFileName);
          
          // Renombrar archivo
          if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            transferenciaFotoFileName = newFileName;
          }
        }

        // Crear los items del pedido
        const itemsData = createPedidoDto.items.map(item => ({
          pedidoId: newPedido.id,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio: item.precio,
        }));

        await prisma.itemPedido.createMany({
          data: itemsData
        });

        return newPedido;
      });

      const pedidoCompleto = await this.findOne(pedido.id);
      
      // Crear notificaciones
      try {
        const { deliveryLocation, shippingPrice } = createPedidoDto as any;
        const notifications = await this.notificationsService.createOrderNotification(
          pedidoCompleto.id,
          pedidoCompleto.clienteId,
          pedidoCompleto.empresaId,
          pedidoCompleto.cliente.name,
          empresa.name,
          pedidoCompleto.total,
          {
            deliveryLocation,
            shippingPrice
          }
        );

        // Enviar notificaciones por WebSocket
        await this.webSocketGateway.sendNotificationToUser(
          pedidoCompleto.empresaId,
          notifications.empresa
        );
        await this.webSocketGateway.sendNotificationToUser(
          pedidoCompleto.clienteId,
          notifications.cliente
        );

        // Actualizar contadores de notificaciones
        const empresaUnreadCount = await this.notificationsService.countUnreadByUser(
          pedidoCompleto.empresaId,
          'empresa'
        );
        const clienteUnreadCount = await this.notificationsService.countUnreadByUser(
          pedidoCompleto.clienteId,
          'cliente'
        );

        await this.webSocketGateway.sendNotificationCountUpdate(
          pedidoCompleto.empresaId,
          empresaUnreadCount
        );
        await this.webSocketGateway.sendNotificationCountUpdate(
          pedidoCompleto.clienteId,
          clienteUnreadCount
        );
      } catch (notificationError) {
        console.error('Error enviando notificaciones:', notificationError);
        // No lanzar error para no interrumpir la creación del pedido
      }

      return pedidoCompleto;
    } catch (error) {
      console.error('Error creando pedido:', error);
      throw error;
    }
  }

  // obtiene pedidos de un cliente por email
  async findAllByClienteEmail(clienteEmail: string): Promise<PedidoWithItems[]> {
    try {
      const pedidos = await this.prisma.pedido.findMany({
        where: {
          cliente: {
            email: clienteEmail
          }
        },
        include: {
          ItemPedido: {
            include: {
              producto: {
                select: {
                  id: true,
                  nombre: true,
                  precio: true
                }
              }
            }
          },
          empresa: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const cliente = await this.prisma.cliente.findUnique({
        where: { email: clienteEmail }
      });

      // Convertir Decimal a number para compatibilidad con el frontend
      return pedidos.map(pedido => ({
        id: pedido.id,
        clienteId: pedido.clienteId,
        clienteNombre: cliente.name,
        clienteEmail: cliente.email,
        empresaId: pedido.empresaId,
        estado: pedido.estado as 'pendiente_confirmacion' | 'confirmado' | 'en_proceso' | 'esperando_delivery' | 'en_camino' | 'entregado' | 'esperando_retiro' | 'no_confirmado' | 'cancelado',
        tipoEntrega: pedido.tipoEntrega,
        formaPago: pedido.formaPago,
        motivoRechazo: pedido.motivoRechazo,
        createdAt: pedido.createdAt,
        updatedAt: pedido.updatedAt,
        empresa: pedido.empresa,
        items: pedido.ItemPedido.map(item => ({
          id: item.id,
          pedidoId: item.pedidoId,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio: parseFloat(item.precio.toString()), // Convert Decimal to number
          producto: {
            id: item.producto.id,
            nombre: item.producto.nombre,
            precio: parseFloat(item.producto.precio.toString()), // Convert Decimal to number
          }
        })),
        total: pedido.ItemPedido.reduce((sum, item) =>
          sum + (parseFloat(item.precio.toString()) * item.cantidad), 0
        ),
      }));
    } catch (error) {
      throw new BadRequestException('Error al obtener pedidos del cliente');
    }
  }

  // encuentra todos los pedidos de la empresa
  async findAllByEmpresa(empresaId: string): Promise<PedidoWithItems[]> {
    try {
      const pedidos = await this.prisma.pedido.findMany({
        where: { empresaId },
        include: {
          cliente: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          ItemPedido: {
            include: {
              producto: {
                select: {
                  id: true,
                  nombre: true,
                  precio: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Enriquecer con extras (deliveryLocation, shippingPrice) desde la notificación de creación
      const enriched = await Promise.all(pedidos.map(async (pedido) => {
        const noti = await this.prisma.notificacion.findFirst({
          where: {
            tipo: 'pedido_creado',
            metadata: {
              path: ['pedidoId'],
              equals: pedido.id,
            },
          },
          orderBy: { createdAt: 'desc' },
          select: { metadata: true },
        });

        const deliveryLocation = (noti?.metadata as any)?.deliveryLocation || undefined;
        const shippingPrice = (noti?.metadata as any)?.shippingPrice || undefined;

        return {
          id: pedido.id,
          clienteId: pedido.clienteId,
          empresaId: pedido.empresaId,
          estado: pedido.estado,
          tipoEntrega: pedido.tipoEntrega,
          formaPago: pedido.formaPago,
          motivoRechazo: pedido.motivoRechazo,
          createdAt: pedido.createdAt,
          updatedAt: pedido.updatedAt,
          cliente: pedido.cliente,
          items: pedido.ItemPedido.map(item => ({
            id: item.id,
            pedidoId: item.pedidoId,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precio: parseFloat(item.precio.toString()),
            producto: {
              id: item.producto.id,
              nombre: item.producto.nombre,
              precio: parseFloat(item.producto.precio.toString())
            }
          })),
          total: pedido.ItemPedido.reduce((sum, item) => 
            sum + (parseFloat(item.precio.toString()) * item.cantidad), 0
          ),
          deliveryLocation,
          shippingPrice,
        } as any;
      }));

      return enriched as any;
    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
      throw error;
    }
  }

  // encuentra un pedido de la empresa
  async findOne(id: string): Promise<PedidoWithItems> {
    try {
      const pedido = await this.prisma.pedido.findUnique({
        where: { id },
        include: {
          cliente: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          ItemPedido: {
            include: {
              producto: {
                select: {
                  id: true,
                  nombre: true,
                  precio: true
                }
              }
            }
          }
        }
      });

      if (!pedido) {
        throw new NotFoundException('Pedido no encontrado');
      }

      // Extraer extras desde notificación de creación
      const noti = await this.prisma.notificacion.findFirst({
        where: {
          tipo: 'pedido_creado',
          metadata: {
            path: ['pedidoId'],
            equals: pedido.id,
          },
        },
        orderBy: { createdAt: 'desc' },
        select: { metadata: true },
      });

      const deliveryLocation = (noti?.metadata as any)?.deliveryLocation || undefined;
      const shippingPrice = (noti?.metadata as any)?.shippingPrice || undefined;

      return {
        id: pedido.id,
        clienteId: pedido.clienteId,
        empresaId: pedido.empresaId,
        estado: pedido.estado,
        tipoEntrega: pedido.tipoEntrega,
        formaPago: pedido.formaPago,
        motivoRechazo: pedido.motivoRechazo,
        createdAt: pedido.createdAt,
        updatedAt: pedido.updatedAt,
        cliente: pedido.cliente,
        items: pedido.ItemPedido.map(item => ({
          id: item.id,
          pedidoId: item.pedidoId,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio: parseFloat(item.precio.toString()),
          producto: {
            id: item.producto.id,
            nombre: item.producto.nombre,
            precio: parseFloat(item.producto.precio.toString())
          }
        })),
        total: pedido.ItemPedido.reduce((sum, item) => 
          sum + (parseFloat(item.precio.toString()) * item.cantidad), 0
        ),
        deliveryLocation,
        shippingPrice,
      } as any;
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      throw error;
    }
  }

  // actualiza los pedidos de la empresa
  async update(id: string, updatePedidoDto: UpdatePedidoDto): Promise<PedidoWithItems> {
    try {
      // Verificar que el pedido existe
      const existingPedido = await this.prisma.pedido.findUnique({
        where: { id },
        include: {
          cliente: { select: { id: true, name: true } },
          empresa: { select: { id: true, name: true } }
        }
      });

      if (!existingPedido) {
        throw new NotFoundException('Pedido no encontrado');
      }

      const oldStatus = existingPedido.estado;
      const newStatus = updatePedidoDto.estado;

      // Actualizar el pedido
      await this.prisma.pedido.update({
        where: { id },
        data: updatePedidoDto
      });

      const pedidoActualizado = await this.findOne(id);

      // Si el estado cambió, crear notificación
      if (oldStatus !== newStatus && newStatus) {
        try {
          const notification = await this.notificationsService.createOrderStatusNotification(
            pedidoActualizado.id,
            pedidoActualizado.clienteId,
            pedidoActualizado.empresaId,
            pedidoActualizado.cliente.name,
            existingPedido.empresa.name,
            oldStatus,
            newStatus,
            pedidoActualizado.total
          );

          // Enviar notificación por WebSocket
          await this.webSocketGateway.sendNotificationToUser(
            pedidoActualizado.clienteId,
            notification
          );

          // Actualizar contador de notificaciones del cliente
          const clienteUnreadCount = await this.notificationsService.countUnreadByUser(
            pedidoActualizado.clienteId,
            'cliente'
          );

          await this.webSocketGateway.sendNotificationCountUpdate(
            pedidoActualizado.clienteId,
            clienteUnreadCount
          );
        } catch (notificationError) {
          console.error('Error enviando notificación de cambio de estado:', notificationError);
          // No lanzar error para no interrumpir la actualización del pedido
        }
      }

      // Si el pedido se confirma, eliminar la foto de transferencia
      if (newStatus === 'confirmado' && existingPedido.formaPago === 'transferencia') {
        try {
          await this.deleteTransferenciaFoto(id);
          console.log(`Foto de transferencia eliminada para pedido ${id}`);
        } catch (photoError) {
          console.error('Error eliminando foto de transferencia:', photoError);
          // No lanzar error para no interrumpir la actualización del pedido
        }
      }

      return pedidoActualizado;
    } catch (error) {
      console.error('Error actualizando pedido:', error);
      throw error;
    }
  }

  // obtiene las estadisticas de la empresa
  async getStats(empresaId: string) {
    try {
      const [
        total, 
        pendientesConfirmacion, 
        confirmados, 
        noConfirmados,
        enProceso, 
        esperandoDelivery,
        enCamino,
        entregados,
        esperandoRetiro
      ] = await Promise.all([
        this.prisma.pedido.count({ where: { empresaId } }),
        this.prisma.pedido.count({ where: { empresaId, estado: 'pendiente_confirmacion' } }),
        this.prisma.pedido.count({ where: { empresaId, estado: 'confirmado' } }),
        this.prisma.pedido.count({ where: { empresaId, estado: 'no_confirmado' } }),
        this.prisma.pedido.count({ where: { empresaId, estado: 'en_proceso' } }),
        this.prisma.pedido.count({ where: { empresaId, estado: 'esperando_delivery' } }),
        this.prisma.pedido.count({ where: { empresaId, estado: 'en_camino' } }),
        this.prisma.pedido.count({ where: { empresaId, estado: 'entregado' } }),
        this.prisma.pedido.count({ where: { empresaId, estado: 'esperando_retiro' } })
      ]);

      return {
        total,
        pendientesConfirmacion,
        confirmados,
        noConfirmados,
        enProceso,
        esperandoDelivery,
        enCamino,
        entregados,
        esperandoRetiro
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de pedidos:', error);
      throw error;
    }
  }

  // rechaza un pedido (cambia estado a no_confirmado)
  async rejectPedido(id: string, motivo?: string): Promise<PedidoWithItems> {
    try {
      const pedido = await this.prisma.pedido.findUnique({
        where: { id },
        include: {
          cliente: { select: { id: true, name: true } },
          empresa: { select: { id: true, name: true } }
        }
      });

      if (!pedido) {
        throw new NotFoundException('Pedido no encontrado');
      }

      // Actualizar el pedido a estado no_confirmado
      const pedidoActualizado = await this.prisma.pedido.update({
        where: { id },
        data: { 
          estado: 'no_confirmado',
          motivoRechazo: motivo || null
        }
      });

      // Obtener el pedido completo actualizado
      const pedidoCompleto = await this.findOne(id);

      // Enviar notificación al cliente
      if (motivo && motivo.trim()) {
        try {
          const notification = await this.notificationsService.create({
            userId: pedido.clienteId,
            userType: 'cliente',
            titulo: 'Pedido No Confirmado',
            mensaje: `${pedido.empresa.name} no confirmó tu pedido. Motivos: ${motivo}`,
            tipo: 'pedido_rechazado',
            metadata: {
              pedidoId: id,
              empresaId: pedido.empresaId,
              empresaName: pedido.empresa.name,
              motivo: motivo,
              icono: '❌'
            },
          });

          // Enviar notificación por WebSocket
          await this.webSocketGateway.sendNotificationToUser(
            pedido.clienteId,
            notification
          );

          // Actualizar contador de notificaciones del cliente
          const clienteUnreadCount = await this.notificationsService.countUnreadByUser(
            pedido.clienteId,
            'cliente'
          );

          await this.webSocketGateway.sendNotificationCountUpdate(
            pedido.clienteId,
            clienteUnreadCount
          );
        } catch (notificationError) {
          console.error('Error enviando notificación de rechazo:', notificationError);
          // No lanzar error para no interrumpir la actualización del pedido
        }
      }

      return pedidoCompleto;
    } catch (error) {
      console.error('Error rechazando pedido:', error);
      throw error;
    }
  }

  // elimina un pedido de la empresa (mantener para compatibilidad)
  async remove(id: string): Promise<void> {
    try {
      const pedido = await this.prisma.pedido.findUnique({
        where: { id }
      });

      if (!pedido) {
        throw new NotFoundException('Pedido no encontrado');
      }

      // Eliminar el pedido (los items se eliminan en cascada)
      await this.prisma.pedido.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error eliminando pedido:', error);
      throw error;
    }
  }

  /**
   * Obtiene la foto de transferencia de un pedido
   */
  async getTransferenciaFoto(pedidoId: string): Promise<{ base64: string; mimeType: string } | null> {
    try {
      // Buscar archivos de foto que coincidan con el patrón del pedido
      const fs = require('fs');
      const path = require('path');
      const tempDir = this.tempPhotoService['tempDir'];
      
      if (!fs.existsSync(tempDir)) {
        return null;
      }

      const files = fs.readdirSync(tempDir);
      const fotoFile = files.find(file => file.includes(`_${pedidoId}_`));
      
      if (!fotoFile) {
        return null;
      }

      const base64 = this.tempPhotoService.getTempPhotoAsBase64(fotoFile);
      if (!base64) {
        return null;
      }

      // Extraer tipo MIME del Base64
      const mimeType = base64.split(';')[0].split(':')[1];
      
      return { base64, mimeType };
    } catch (error) {
      console.error('Error obteniendo foto de transferencia:', error);
      return null;
    }
  }

  /**
   * Elimina la foto de transferencia de un pedido (se llama al confirmar)
   */
  async deleteTransferenciaFoto(pedidoId: string): Promise<boolean> {
    try {
      const fs = require('fs');
      const path = require('path');
      const tempDir = this.tempPhotoService['tempDir'];
      
      if (!fs.existsSync(tempDir)) {
        return false;
      }

      const files = fs.readdirSync(tempDir);
      const fotoFile = files.find(file => file.startsWith(`transferencia_${pedidoId}_`));
      
      if (!fotoFile) {
        return false;
      }

      return this.tempPhotoService.deleteTempPhoto(fotoFile);
    } catch (error) {
      console.error('Error eliminando foto de transferencia:', error);
      return false;
    }
  }
}
