import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VincularEmpresaDto } from './dto/vincular-empresa.dto';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto';
import { UpdateUbicacionRepartidorDto } from './dto/update-ubicacion-repartidor.dto';
import { NotificationsWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class RepartidoresService {
  constructor(
    private prisma: PrismaService,
    private wsGateway: NotificationsWebSocketGateway,
  ) {}

  /**
   * Obtener las empresas vinculadas de un repartidor
   */
  async getMisEmpresas(repartidorId: string) {
    const vinculaciones = await this.prisma.empresaRepartidor.findMany({
      where: {
        repartidorId,
      },
      include: {
        empresa: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return vinculaciones.map(v => ({
      id: v.empresa.id,
      name: v.empresa.name,
      email: v.empresa.email,
      estado: v.estado,
      vinculacionId: v.id,
    }));
  }

  /**
   * Aceptar una solicitud de vinculación
   */
  async aceptarVinculacion(repartidorId: string, vinculacionId: number) {
    const vinculacion = await this.prisma.empresaRepartidor.findUnique({
      where: { id: vinculacionId },
      include: {
        empresa: true,
        repartidor: true,
      },
    });

    if (!vinculacion) {
      throw new NotFoundException('Vinculación no encontrada');
    }

    if (vinculacion.repartidorId !== repartidorId) {
      throw new ForbiddenException('Esta vinculación no te pertenece');
    }

    if (vinculacion.estado !== 'PENDIENTE') {
      throw new BadRequestException('Esta vinculación ya fue procesada');
    }

    await this.prisma.empresaRepartidor.update({
      where: { id: vinculacionId },
      data: { estado: 'ACEPTADO' },
    });

    // Enviar evento WebSocket a la empresa
    console.log('🔔 [REPARTIDOR] Enviando notificación de vinculación aceptada a empresa:', vinculacion.empresaId);
    await this.wsGateway.sendVinculacionActualizada(vinculacion.empresaId, {
      repartidorId: vinculacion.repartidorId,
      repartidorName: vinculacion.repartidor.name,
      estado: 'ACEPTADO',
      vinculacionId: vinculacionId,
    });

    return { message: 'Vinculación aceptada correctamente' };
  }

  /**
   * Rechazar una solicitud de vinculación
   */
  async rechazarVinculacion(repartidorId: string, vinculacionId: number) {
    const vinculacion = await this.prisma.empresaRepartidor.findUnique({
      where: { id: vinculacionId },
      include: {
        empresa: true,
        repartidor: true,
      },
    });

    if (!vinculacion) {
      throw new NotFoundException('Vinculación no encontrada');
    }

    if (vinculacion.repartidorId !== repartidorId) {
      throw new ForbiddenException('Esta vinculación no te pertenece');
    }

    if (vinculacion.estado !== 'PENDIENTE') {
      throw new BadRequestException('Esta vinculación ya fue procesada');
    }

    await this.prisma.empresaRepartidor.update({
      where: { id: vinculacionId },
      data: { estado: 'RECHAZADO' },
    });

    // Enviar evento WebSocket a la empresa
    console.log('🔔 [REPARTIDOR] Enviando notificación de vinculación rechazada a empresa:', vinculacion.empresaId);
    await this.wsGateway.sendVinculacionActualizada(vinculacion.empresaId, {
      repartidorId: vinculacion.repartidorId,
      repartidorName: vinculacion.repartidor.name,
      estado: 'RECHAZADO',
      vinculacionId: vinculacionId,
    });

    return { message: 'Vinculación rechazada correctamente' };
  }

  /**
   * Vincular un repartidor con una empresa usando código de vinculación
   * NOTA: Este método es un placeholder - necesitás implementar lógica para buscar empresas por código
   */
  async vincularEmpresa(repartidorId: string, dto: VincularEmpresaDto) {
    // Verificar que el repartidor existe
    const repartidor = await this.prisma.repartidor.findUnique({
      where: { id: repartidorId },
    });

    if (!repartidor) {
      throw new NotFoundException('Repartidor no encontrado');
    }

    // TODO: Implementar lógica para buscar empresa por código de vinculación
    // Por ahora, este método requiere implementación adicional según tu lógica de negocio
    throw new BadRequestException('Funcionalidad de vinculación con código pendiente de implementación. Por favor contactá a una empresa directamente para vincular.');
  }

  /**
   * Obtener pedidos disponibles para el repartidor
   * Son pedidos en estado 'esperando_delivery' de empresas vinculadas
   */
  async getPedidosDisponibles(repartidorId: string) {
    // Obtener IDs de empresas vinculadas y aceptadas
    const vinculaciones = await this.prisma.empresaRepartidor.findMany({
      where: {
        repartidorId,
        estado: 'ACEPTADO',
      },
      select: {
        empresaId: true,
      },
    });

    const empresaIds = vinculaciones.map(v => v.empresaId);

    if (empresaIds.length === 0) {
      return [];
    }

    // Buscar pedidos esperando delivery de esas empresas
    const pedidos = await this.prisma.pedido.findMany({
      where: {
        empresaId: { in: empresaIds },
        estado: 'esperando_delivery',
        repartidorId: null, // Sin asignar
      },
      include: {
        cliente: {
          select: {
            name: true,
          },
        },
        empresa: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return pedidos.map(p => ({
      id: p.id,
      clienteName: p.cliente.name,
      empresaName: p.empresa.name,
      empresaId: p.empresaId,
      tipoEntrega: p.tipoEntrega,
      direccion: p.direccion || '',
      total: p.total ? parseFloat(p.total.toString()) : 0,
      createdAt: p.createdAt,
    }));
  }

  /**
   * Tomar un pedido (asignarlo al repartidor)
   */
  async tomarPedido(repartidorId: string, pedidoId: string) {
    // Verificar que el pedido existe y está disponible
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        empresa: {
          include: {
            repartidores: true,
          },
        },
      },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Verificar que el repartidor está vinculado y aceptado
    const vinculacion = pedido.empresa.repartidores.find(
      r => r.repartidorId === repartidorId && r.estado === 'ACEPTADO'
    );

    if (!vinculacion) {
      throw new ForbiddenException('No estás vinculado a esta empresa o la solicitud está pendiente');
    }

    // Verificar que el pedido está en estado correcto
    if (pedido.estado !== 'esperando_delivery') {
      throw new BadRequestException('El pedido no está disponible para ser tomado');
    }

    // Asignar el pedido al repartidor
    await this.prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        repartidorId,
      },
    });

    return { message: 'Pedido asignado exitosamente', pedidoId };
  }

  /**
   * Obtener los pedidos de un repartidor
   */
  async getMisPedidos(repartidorId: string) {
    const pedidos = await this.prisma.pedido.findMany({
      where: {
        repartidorId,
      },
      include: {
        empresa: {
          select: {
            name: true,
          },
        },
        cliente: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return pedidos.map(p => ({
      id: p.id,
      empresaName: p.empresa.name,
      clienteName: p.cliente.name,
      tipoEntrega: p.tipoEntrega,
      direccion: p.direccion || '',
      lat: p.lat,
      lng: p.lng,
      repartidorLat: p.repartidorLat,
      repartidorLng: p.repartidorLng,
      repartidorUltActualizacion: p.repartidorUltActualizacion,
      total: p.total ? parseFloat(p.total.toString()) : 0,
      estado: p.estado,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  /**
   * Actualizar el estado de un pedido
   */
  async updateEstadoPedido(repartidorId: string, pedidoId: string, dto: UpdateEstadoPedidoDto) {
    // Verificar que el pedido pertenece al repartidor
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (pedido.repartidorId !== repartidorId) {
      throw new ForbiddenException('Este pedido no te pertenece');
    }

    // Actualizar el estado
    await this.prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        estado: dto.estado,
      },
    });

    return { message: 'Estado actualizado correctamente', estado: dto.estado };
  }

  /**
   * Actualizar la ubicación del repartidor en tiempo real
   * Solo permite actualizar si el pedido está en estado 'en_camino'
   */
  async updateUbicacionRepartidor(
    repartidorId: string,
    pedidoId: string,
    dto: UpdateUbicacionRepartidorDto
  ) {
    // Verificar que el pedido existe y pertenece al repartidor
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        cliente: { select: { id: true } },
        empresa: { select: { id: true } }
      }
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (pedido.repartidorId !== repartidorId) {
      throw new ForbiddenException('Este pedido no te pertenece');
    }

    // Solo permitir actualizar ubicación si el pedido está en camino
    if (pedido.estado !== 'en_camino') {
      throw new BadRequestException('Solo puedes compartir tu ubicación cuando el pedido está en camino');
    }

    // Actualizar ubicación del repartidor en el pedido
    console.log(`📍 [Ubicación] Actualizando ubicación del repartidor para pedido ${pedidoId}`);
    console.log(`📍 [Ubicación] Coordenadas recibidas: lat=${dto.lat}, lng=${dto.lng}`);

    const pedidoActualizado = await this.prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        repartidorLat: dto.lat,
        repartidorLng: dto.lng,
        repartidorUltActualizacion: new Date()
      }
    });

    // Enviar actualización por WebSocket a cliente y empresa
    const ubicacionData = {
      pedidoId,
      latitud: dto.lat,
      longitud: dto.lng,
      timestamp: pedidoActualizado.repartidorUltActualizacion
    };

    console.log(`📍 [Ubicación] Datos a enviar por WebSocket:`, ubicacionData);

    try {
      await this.wsGateway.sendUbicacionRepartidorUpdate(
        pedido.clienteId,
        pedido.empresaId,
        ubicacionData
      );
    } catch (error) {
      console.error('Error enviando actualización de ubicación por WebSocket:', error);
      // No lanzar error para no interrumpir la actualización
    }

    return {
      message: 'Ubicación actualizada correctamente',
      lat: dto.lat,
      lng: dto.lng,
      timestamp: pedidoActualizado.repartidorUltActualizacion
    };
  }
}

