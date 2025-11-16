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
      // Verificar que la empresa existe y obtener ubicación
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: createPedidoDto.empresaId },
        include: {
          ubicacion: {
            include: {
              preciosEnvio: true
            }
          }
        }
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

      // Verificar que todos los productos existen y obtener ingredientes
      const productIds = createPedidoDto.items.map(item => item.productoId);
      const productos = await this.prisma.productos.findMany({
        where: {
          id: { in: productIds },
          empresaId: createPedidoDto.empresaId,
          activo: true
        },
        include: {
          ingredientes: {
            include: {
              ingrediente: true
            }
          }
        }
      });

      if (productos.length !== productIds.length) {
        throw new BadRequestException('Algunos productos no existen o no están activos');
      }

      // Calcular subtotal (precio de productos + ingredientes extras)
      let subtotal = 0;
      const itemsConPrecios = [];

      for (const item of createPedidoDto.items) {
        const producto = productos.find(p => p.id === item.productoId);
        if (!producto) continue;

        // Precio base del producto
        let precioUnitario = parseFloat(producto.precio.toString());

        // Agregar precio de ingredientes extras
        if (item.ingredientesExtras && item.ingredientesExtras.length > 0) {
          for (const extra of item.ingredientesExtras) {
            const productoIngrediente = await this.prisma.productoIngrediente.findUnique({
              where: { id: extra.productoIngredienteId }
            });

            if (productoIngrediente && productoIngrediente.precioExtra) {
              const precioExtra = parseFloat(productoIngrediente.precioExtra.toString());
              precioUnitario += precioExtra * extra.cantidad;
            }
          }
        }

        const precioTotalItem = precioUnitario * item.cantidad;
        subtotal += precioTotalItem;

        itemsConPrecios.push({
          ...item,
          precioCalculado: precioUnitario
        });
      }

      // Calcular costo de envío si es delivery
      let costoEnvio = 0;
      if (createPedidoDto.tipoEntrega === 'delivery' && createPedidoDto.ubicacion && empresa.ubicacion) {
        // Calcular distancia usando fórmula de Haversine
        const lat1 = empresa.ubicacion.lat;
        const lon1 = empresa.ubicacion.lng;
        const lat2 = createPedidoDto.ubicacion.lat;
        const lon2 = createPedidoDto.ubicacion.lng;

        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distanciaKm = R * c;

        // Buscar precio de envío según distancia
        const preciosEnvio = empresa.ubicacion.preciosEnvio;
        if (preciosEnvio && preciosEnvio.length > 0) {
          // Ordenar por distancia ascendente
          const preciosOrdenados = preciosEnvio.sort((a, b) => a.distancia - b.distancia);

          // Encontrar el precio correspondiente a la distancia
          const precioEnvio = preciosOrdenados.find(pe => distanciaKm <= pe.distancia);

          if (precioEnvio) {
            costoEnvio = parseFloat(precioEnvio.precio.toString());
          } else {
            // Si supera todas las distancias, usar el precio más alto
            const ultimoPrecio = preciosOrdenados[preciosOrdenados.length - 1];
            costoEnvio = parseFloat(ultimoPrecio.precio.toString());
          }
        }
      }

      const totalFinal = subtotal + costoEnvio;

      // Manejar foto de transferencia si existe
      let transferenciaFotoFileName: string | null = null;

      if (createPedidoDto.transferenciaFoto && createPedidoDto.formaPago === 'transferencia') {
        transferenciaFotoFileName = await this.tempPhotoService.saveTempPhoto(
          'temp_' + Date.now(),
          createPedidoDto.transferenciaFoto
        );
      }

      // Crear el pedido con sus items en una transacción
      const pedido = await this.prisma.$transaction(async (prisma) => {
        // Crear el pedido con todos los datos calculados
        const newPedido = await prisma.pedido.create({
          data: {
            clienteId: createPedidoDto.clienteId,
            empresaId: createPedidoDto.empresaId,
            estado: 'pendiente_confirmacion',
            tipoEntrega: createPedidoDto.tipoEntrega,
            formaPago: createPedidoDto.formaPago,
            direccion: createPedidoDto.ubicacion?.direccion || null,
            lat: createPedidoDto.ubicacion?.lat || null,
            lng: createPedidoDto.ubicacion?.lng || null,
            subtotal: subtotal,
            costoEnvio: costoEnvio,
            total: totalFinal,
          }
        });

        // Renombrar la foto con el ID real del pedido si existe
        if (transferenciaFotoFileName) {
          const fs = require('fs');
          const newFileName = transferenciaFotoFileName.replace('temp_', `transferencia_${newPedido.id}_`);
          const oldPath = this.tempPhotoService.getTempPhotoPath(transferenciaFotoFileName);
          const newPath = this.tempPhotoService.getTempPhotoPath(newFileName);

          if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            transferenciaFotoFileName = newFileName;
          }
        }

        // Crear los items del pedido con precios calculados
        const itemsData = itemsConPrecios.map(item => ({
          pedidoId: newPedido.id,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio: item.precioCalculado, // Precio ya calculado con extras
          notas: item.notas || null,
          ingredientesExtras: item.ingredientesExtras ? JSON.stringify(item.ingredientesExtras) : null,
        }));

        await prisma.itemPedido.createMany({
          data: itemsData
        });

        return newPedido;
      });

      const pedidoCompleto = await this.findOne(pedido.id);

      // Crear notificaciones
      try {
        const notifications = await this.notificationsService.createOrderNotification(
          pedidoCompleto.id,
          pedidoCompleto.clienteId,
          pedidoCompleto.empresaId,
          pedidoCompleto.cliente.name,
          empresa.name,
          parseFloat(pedidoCompleto.total.toString()),
          {}
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
        direccion: pedido.direccion,
        lat: pedido.lat,
        lng: pedido.lng,
        repartidorLat: pedido.repartidorLat,
        repartidorLng: pedido.repartidorLng,
        repartidorUltActualizacion: pedido.repartidorUltActualizacion,
        subtotal: pedido.subtotal ? parseFloat(pedido.subtotal.toString()) : undefined,
        costoEnvio: pedido.costoEnvio ? parseFloat(pedido.costoEnvio.toString()) : undefined,
        total: pedido.total ? parseFloat(pedido.total.toString()) : undefined,
        createdAt: pedido.createdAt,
        updatedAt: pedido.updatedAt,
        empresa: pedido.empresa,
        items: pedido.ItemPedido.map(item => ({
          id: item.id,
          pedidoId: item.pedidoId,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio: parseFloat(item.precio.toString()), // Convert Decimal to number
          notas: item.notas || undefined,
          ingredientesExtras: item.ingredientesExtras ? JSON.parse(JSON.stringify(item.ingredientesExtras)) : undefined,
          producto: {
            id: item.producto.id,
            nombre: item.producto.nombre,
            name: item.producto.nombre, // Alias for frontend compatibility
            precio: parseFloat(item.producto.precio.toString()), // Convert Decimal to number
          }
        })),
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

      return pedidos.map((pedido) => ({
        id: pedido.id,
        clienteId: pedido.clienteId,
        empresaId: pedido.empresaId,
        estado: pedido.estado,
        tipoEntrega: pedido.tipoEntrega,
        formaPago: pedido.formaPago,
        motivoRechazo: pedido.motivoRechazo,
        direccion: pedido.direccion,
        lat: pedido.lat,
        lng: pedido.lng,
        repartidorLat: pedido.repartidorLat,
        repartidorLng: pedido.repartidorLng,
        repartidorUltActualizacion: pedido.repartidorUltActualizacion,
        subtotal: pedido.subtotal ? parseFloat(pedido.subtotal.toString()) : undefined,
        costoEnvio: pedido.costoEnvio ? parseFloat(pedido.costoEnvio.toString()) : undefined,
        total: pedido.total ? parseFloat(pedido.total.toString()) : undefined,
        createdAt: pedido.createdAt,
        updatedAt: pedido.updatedAt,
        cliente: pedido.cliente,
        items: pedido.ItemPedido.map(item => ({
          id: item.id,
          pedidoId: item.pedidoId,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio: parseFloat(item.precio.toString()),
          notas: item.notas || undefined,
          ingredientesExtras: item.ingredientesExtras ? JSON.parse(JSON.stringify(item.ingredientesExtras)) : undefined,
          producto: {
            id: item.producto.id,
            nombre: item.producto.nombre,
            name: item.producto.nombre, // Alias for frontend compatibility
            precio: parseFloat(item.producto.precio.toString())
          }
        })),
      }));
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
          empresa: {
            select: {
              id: true,
              name: true,
              logo: true,
              ubicacion: {
                select: {
                  direccion: true
                }
              }
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

      return {
        id: pedido.id,
        clienteId: pedido.clienteId,
        empresaId: pedido.empresaId,
        estado: pedido.estado,
        tipoEntrega: pedido.tipoEntrega,
        formaPago: pedido.formaPago,
        motivoRechazo: pedido.motivoRechazo,
        direccion: pedido.direccion,
        lat: pedido.lat,
        lng: pedido.lng,
        repartidorLat: pedido.repartidorLat,
        repartidorLng: pedido.repartidorLng,
        repartidorUltActualizacion: pedido.repartidorUltActualizacion,
        subtotal: pedido.subtotal ? parseFloat(pedido.subtotal.toString()) : undefined,
        costoEnvio: pedido.costoEnvio ? parseFloat(pedido.costoEnvio.toString()) : undefined,
        total: pedido.total ? parseFloat(pedido.total.toString()) : undefined,
        createdAt: pedido.createdAt,
        updatedAt: pedido.updatedAt,
        cliente: pedido.cliente,
        empresa: {
          id: pedido.empresa.id,
          name: pedido.empresa.name,
          logo: pedido.empresa.logo,
          address: pedido.empresa.ubicacion?.direccion
        },
        items: pedido.ItemPedido.map(item => ({
          id: item.id,
          pedidoId: item.pedidoId,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio: parseFloat(item.precio.toString()),
          notas: item.notas || undefined,
          ingredientesExtras: item.ingredientesExtras ? JSON.parse(JSON.stringify(item.ingredientesExtras)) : undefined,
          producto: {
            id: item.producto.id,
            nombre: item.producto.nombre,
            name: item.producto.nombre, // Alias for frontend compatibility
            precio: parseFloat(item.producto.precio.toString())
          }
        })),
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

      // Preparar datos de actualización
      const updateData: any = { ...updatePedidoDto };

      // Si el pedido pasa a estado "entregado", guardar timestamp
      if (newStatus === 'entregado' && oldStatus !== 'entregado') {
        updateData.entregadoAt = new Date();
      }

      // Actualizar el pedido
      await this.prisma.pedido.update({
        where: { id },
        data: updateData
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

      // Si el pedido se confirma y es delivery, notificar a todos los repartidores
      if (newStatus === 'confirmado' && pedidoActualizado.tipoEntrega === 'delivery') {
        try {
          console.log(`📤 [Pedido] Pedido confirmado con delivery, notificando a repartidores`);

          const pedidoData = {
            id: pedidoActualizado.id,
            empresaId: pedidoActualizado.empresaId,
            empresaName: existingPedido.empresa.name,
            clienteName: pedidoActualizado.cliente.name,
            direccion: pedidoActualizado.direccion,
            total: parseFloat(pedidoActualizado.total.toString()),
            tipoEntrega: pedidoActualizado.tipoEntrega,
            createdAt: pedidoActualizado.createdAt
          };

          await this.webSocketGateway.sendNuevoPedidoDisponible(
            pedidoActualizado.empresaId,
            pedidoData
          );

          console.log(`✅ [Pedido] Notificación de nuevo pedido disponible enviada`);
        } catch (wsError) {
          console.error('Error enviando notificación de nuevo pedido disponible:', wsError);
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

  /**
   * Asigna un repartidor a un pedido
   * El repartidor recibe notificación automática via WebSocket
   */
  async asignarRepartidor(pedidoId: string, repartidorId: string, empresaId: string): Promise<PedidoWithItems> {
    try {
      // Verificar que el pedido existe y pertenece a la empresa
      const pedido = await this.prisma.pedido.findUnique({
        where: { id: pedidoId },
        include: {
          cliente: { select: { id: true, name: true, email: true } },
          empresa: { select: { id: true, name: true } }
        }
      });

      if (!pedido) {
        throw new NotFoundException('Pedido no encontrado');
      }

      if (pedido.empresaId !== empresaId) {
        throw new BadRequestException('No tienes permiso para asignar repartidores a este pedido');
      }

      // Verificar que el repartidor existe y está vinculado a la empresa
      const repartidor = await this.prisma.repartidor.findUnique({
        where: { id: repartidorId }
      });

      if (!repartidor) {
        throw new NotFoundException('Repartidor no encontrado');
      }

      const vinculacion = await this.prisma.empresaRepartidor.findFirst({
        where: {
          empresaId,
          repartidorId,
          estado: 'ACEPTADO'
        }
      });

      if (!vinculacion) {
        throw new BadRequestException('El repartidor no está vinculado con tu empresa');
      }

      // Actualizar el pedido con el repartidor asignado y cambiar estado
      await this.prisma.pedido.update({
        where: { id: pedidoId },
        data: {
          repartidorId,
          estado: 'esperando_delivery' // Estado cuando se asigna repartidor
        }
      });

      const pedidoActualizado = await this.findOne(pedidoId);

      // Enviar notificación al repartidor via WebSocket (no puede rechazarla)
      try {
        const notificationData = {
          tipo: 'pedido_asignado',
          titulo: 'Nuevo Pedido Asignado',
          mensaje: `${pedido.empresa.name} te ha asignado un nuevo pedido`,
          pedidoId: pedidoId,
          empresaId: empresaId,
          empresaNombre: pedido.empresa.name,
          clienteNombre: pedido.cliente.name,
          direccion: pedido.direccion,
          total: parseFloat(pedido.total.toString()),
          tipoEntrega: pedido.tipoEntrega,
          icono: '🛵'
        };

        // Enviar notificación via WebSocket global
        await this.webSocketGateway.sendPedidoAsignadoARepartidor(repartidorId, notificationData);

        // También crear notificación en BD para persistencia
        await this.notificationsService.create({
          userId: repartidorId,
          userType: 'repartidor',
          titulo: 'Nuevo Pedido Asignado',
          mensaje: `${pedido.empresa.name} te ha asignado un nuevo pedido de $${parseFloat(pedido.total.toString()).toFixed(2)}`,
          tipo: 'pedido_asignado',
          metadata: notificationData
        });

      } catch (notificationError) {
        console.error('Error enviando notificación al repartidor:', notificationError);
      }

      return pedidoActualizado;
    } catch (error) {
      console.error('Error asignando repartidor:', error);
      throw error;
    }
  }

  /**
   * Marca el pedido como "en_camino" (solo repartidor)
   * Notifica a la empresa y al cliente
   */
  async marcarEnCamino(pedidoId: string, repartidorId: string): Promise<PedidoWithItems> {
    try {
      // Verificar que el pedido existe y está asignado al repartidor
      const pedido = await this.prisma.pedido.findUnique({
        where: { id: pedidoId },
        include: {
          cliente: { select: { id: true, name: true } },
          empresa: { select: { id: true, name: true } },
          repartidor: { select: { id: true, name: true } }
        }
      });

      if (!pedido) {
        throw new NotFoundException('Pedido no encontrado');
      }

      if (pedido.repartidorId !== repartidorId) {
        throw new BadRequestException('Este pedido no está asignado a ti');
      }

      if (pedido.estado !== 'esperando_delivery') {
        throw new BadRequestException('El pedido no está en estado esperando_delivery');
      }

      // Actualizar estado a en_camino
      await this.prisma.pedido.update({
        where: { id: pedidoId },
        data: { estado: 'en_camino' }
      });

      const pedidoActualizado = await this.findOne(pedidoId);

      // Enviar notificaciones a empresa y cliente
      try {
        // Notificación a la empresa
        const notificationEmpresa = await this.notificationsService.create({
          userId: pedido.empresaId,
          userType: 'empresa',
          titulo: 'Pedido en Camino',
          mensaje: `${pedido.repartidor.name} está en camino con el pedido #${pedidoId.slice(-8)}`,
          tipo: 'pedido_en_camino',
          metadata: {
            pedidoId,
            repartidorId,
            repartidorNombre: pedido.repartidor.name,
            clienteNombre: pedido.cliente.name,
            icono: '🚗'
          }
        });

        await this.webSocketGateway.sendNotificationToUser(pedido.empresaId, notificationEmpresa);

        // Notificación al cliente
        const notificationCliente = await this.notificationsService.create({
          userId: pedido.clienteId,
          userType: 'cliente',
          titulo: 'Tu Pedido Está en Camino',
          mensaje: `${pedido.repartidor.name} está en camino con tu pedido de ${pedido.empresa.name}`,
          tipo: 'pedido_en_camino',
          metadata: {
            pedidoId,
            empresaId: pedido.empresaId,
            empresaNombre: pedido.empresa.name,
            repartidorNombre: pedido.repartidor.name,
            icono: '🚗'
          }
        });

        await this.webSocketGateway.sendNotificationToUser(pedido.clienteId, notificationCliente);

        // Actualizar contadores
        const empresaUnreadCount = await this.notificationsService.countUnreadByUser(pedido.empresaId, 'empresa');
        const clienteUnreadCount = await this.notificationsService.countUnreadByUser(pedido.clienteId, 'cliente');

        await this.webSocketGateway.sendNotificationCountUpdate(pedido.empresaId, empresaUnreadCount);
        await this.webSocketGateway.sendNotificationCountUpdate(pedido.clienteId, clienteUnreadCount);

      } catch (notificationError) {
        console.error('Error enviando notificaciones de en_camino:', notificationError);
      }

      return pedidoActualizado;
    } catch (error) {
      console.error('Error marcando pedido en camino:', error);
      throw error;
    }
  }

  /**
   * Descuenta el stock de los productos de un pedido entregado
   * Permite stock negativo como indicador de faltante
   */
  private async descontarStockPedido(pedidoId: string): Promise<void> {
    try {
      // Obtener todos los items del pedido con información del producto
      const items = await this.prisma.itemPedido.findMany({
        where: { pedidoId },
        include: {
          producto: {
            include: {
              ingredientes: {
                include: {
                  ingrediente: true
                }
              }
            }
          }
        }
      });

      for (const item of items) {
        const { producto, cantidad, ingredientesExtras } = item;

        // Procesar según tipo de stock
        if (producto.tipoStock === 'individual') {
          // Stock individual: restar la cantidad del pedido al stock individual
          await this.prisma.productos.update({
            where: { id: producto.id },
            data: {
              stockIndividual: {
                decrement: cantidad
              }
            }
          });

          console.log(`Stock individual descontado: Producto ${producto.nombre}, cantidad: ${cantidad}, nuevo stock: ${producto.stockIndividual - cantidad}`);

        } else if (producto.tipoStock === 'compuesto') {
          // Stock compuesto: restar ingredientes según la receta
          for (const productoIngrediente of producto.ingredientes) {
            const cantidadTotal = productoIngrediente.cantidadRequerida * cantidad;

            await this.prisma.ingrediente.update({
              where: { id: productoIngrediente.ingredienteId },
              data: {
                stockDisponible: {
                  decrement: cantidadTotal
                }
              }
            });

            console.log(`Stock ingrediente descontado: ${productoIngrediente.ingrediente.nombre}, cantidad: ${cantidadTotal}`);
          }
        }

        // Procesar ingredientes extras si los hay
        if (ingredientesExtras) {
          const extras = Array.isArray(ingredientesExtras)
            ? ingredientesExtras
            : typeof ingredientesExtras === 'string'
              ? JSON.parse(ingredientesExtras)
              : ingredientesExtras;

          if (Array.isArray(extras) && extras.length > 0) {
            for (const extra of extras) {
              if (extra.ingredienteId && extra.cantidad) {
                await this.prisma.ingrediente.update({
                  where: { id: extra.ingredienteId },
                  data: {
                    stockDisponible: {
                      decrement: extra.cantidad
                    }
                  }
                });

                console.log(`Stock extra descontado: ingrediente ID ${extra.ingredienteId}, cantidad: ${extra.cantidad}`);
              }
            }
          }
        }
      }

      console.log(`Stock descontado exitosamente para pedido ${pedidoId}`);
    } catch (error) {
      console.error(`Error descontando stock del pedido ${pedidoId}:`, error);
      // No lanzamos el error para no bloquear la entrega del pedido
      // El stock queda registrado en logs para corrección manual si es necesario
    }
  }

  /**
   * Marca el pedido como "entregado" (solo repartidor)
   * Notifica a la empresa y al cliente
   * Descuenta el stock de los productos
   */
  async marcarEntregado(pedidoId: string, repartidorId: string): Promise<PedidoWithItems> {
    try {
      // Verificar que el pedido existe y está asignado al repartidor
      const pedido = await this.prisma.pedido.findUnique({
        where: { id: pedidoId },
        include: {
          cliente: { select: { id: true, name: true } },
          empresa: { select: { id: true, name: true } },
          repartidor: { select: { id: true, name: true } }
        }
      });

      if (!pedido) {
        throw new NotFoundException('Pedido no encontrado');
      }

      if (pedido.repartidorId !== repartidorId) {
        throw new BadRequestException('Este pedido no está asignado a ti');
      }

      if (pedido.estado !== 'en_camino') {
        throw new BadRequestException('El pedido no está en estado en_camino');
      }

      // Actualizar estado a entregado
      await this.prisma.pedido.update({
        where: { id: pedidoId },
        data: { estado: 'entregado' }
      });

      // Descontar stock de los productos e ingredientes
      await this.descontarStockPedido(pedidoId);

      const pedidoActualizado = await this.findOne(pedidoId);

      // Enviar notificaciones a empresa y cliente
      try {
        // Notificación a la empresa
        const notificationEmpresa = await this.notificationsService.create({
          userId: pedido.empresaId,
          userType: 'empresa',
          titulo: 'Pedido Entregado',
          mensaje: `${pedido.repartidor.name} ha entregado el pedido #${pedidoId.slice(-8)} a ${pedido.cliente.name}`,
          tipo: 'pedido_entregado',
          metadata: {
            pedidoId,
            repartidorId,
            repartidorNombre: pedido.repartidor.name,
            clienteNombre: pedido.cliente.name,
            icono: '✅'
          }
        });

        await this.webSocketGateway.sendNotificationToUser(pedido.empresaId, notificationEmpresa);

        // Notificación al cliente
        const notificationCliente = await this.notificationsService.create({
          userId: pedido.clienteId,
          userType: 'cliente',
          titulo: 'Pedido Entregado',
          mensaje: `Tu pedido de ${pedido.empresa.name} ha sido entregado. ¡Que lo disfrutes!`,
          tipo: 'pedido_entregado',
          metadata: {
            pedidoId,
            empresaId: pedido.empresaId,
            empresaNombre: pedido.empresa.name,
            repartidorNombre: pedido.repartidor.name,
            icono: '✅'
          }
        });

        await this.webSocketGateway.sendNotificationToUser(pedido.clienteId, notificationCliente);

        // Actualizar contadores
        const empresaUnreadCount = await this.notificationsService.countUnreadByUser(pedido.empresaId, 'empresa');
        const clienteUnreadCount = await this.notificationsService.countUnreadByUser(pedido.clienteId, 'cliente');

        await this.webSocketGateway.sendNotificationCountUpdate(pedido.empresaId, empresaUnreadCount);
        await this.webSocketGateway.sendNotificationCountUpdate(pedido.clienteId, clienteUnreadCount);

      } catch (notificationError) {
        console.error('Error enviando notificaciones de entregado:', notificationError);
      }

      return pedidoActualizado;
    } catch (error) {
      console.error('Error marcando pedido como entregado:', error);
      throw error;
    }
  }

  /**
   * Obtiene los datos del mapa para un pedido específico
   * Incluye: ubicación del local, ubicación del cliente, ubicación del repartidor (si está en camino)
   */
  async obtenerDatosMapa(pedidoId: string) {
    try {
      const pedido = await this.prisma.pedido.findUnique({
        where: { id: pedidoId },
        include: {
          empresa: {
            include: {
              ubicacion: true
            }
          },
          repartidor: true
        }
      });

      if (!pedido) {
        throw new NotFoundException('Pedido no encontrado');
      }

      // Formato compatible con la app mobile
      const response: any = {};

      // Ubicación de la empresa
      if (pedido.empresa?.ubicacion) {
        response.empresa = {
          latitud: parseFloat(pedido.empresa.ubicacion.lat.toString()),
          longitud: parseFloat(pedido.empresa.ubicacion.lng.toString()),
          name: pedido.empresa.name
        };
      }

      // Ubicación del cliente
      if (pedido.lat && pedido.lng) {
        response.cliente = {
          latitud: parseFloat(pedido.lat.toString()),
          longitud: parseFloat(pedido.lng.toString())
        };
      }

      // Ubicación del repartidor (solo si el pedido está en camino)
      if (pedido.estado === 'en_camino' && pedido.repartidorLat && pedido.repartidorLng) {
        const repartidorLat = parseFloat(pedido.repartidorLat.toString());
        const repartidorLng = parseFloat(pedido.repartidorLng.toString());

        console.log(`📍 [Mapa] Datos del repartidor: lat=${repartidorLat}, lng=${repartidorLng}`);

        response.repartidor = {
          latitud: repartidorLat,
          longitud: repartidorLng,
          nombre: pedido.repartidor?.name || 'Repartidor'
        };
      } else {
        console.log(`📍 [Mapa] Repartidor no disponible. Estado: ${pedido.estado}, Lat: ${pedido.repartidorLat}, Lng: ${pedido.repartidorLng}`);
      }

      console.log(`📍 [Mapa] Respuesta completa:`, JSON.stringify(response, null, 2));

      return response;
    } catch (error) {
      console.error('Error obteniendo datos del mapa:', error);
      throw error;
    }
  }
}
