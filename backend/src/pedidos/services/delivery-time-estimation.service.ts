import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Interfaz para la estimación de tiempo de entrega
 */
export interface DeliveryTimeEstimation {
  preparacionMinutos: number; // Tiempo de preparación del comercio
  asignacionMinutos: number; // Tiempo de asignación de repartidor
  recojoMinutos: number; // Tiempo de llegada del repartidor al comercio
  entregaMinutos: number; // Tiempo de entrega al cliente
  totalMinutos: number; // Tiempo total estimado
  fechaEntregaEstimada: Date; // Fecha y hora estimada de entrega
  rangoMinimo: number; // Rango mínimo de tiempo
  rangoMaximo: number; // Rango máximo de tiempo
}

/**
 * Parámetros para calcular la estimación
 */
export interface EstimationParams {
  empresaId: string;
  clienteLat?: number;
  clienteLng?: number;
  cantidadItems?: number;
  tipoEntrega: 'delivery' | 'retiro';
}

@Injectable()
export class DeliveryTimeEstimationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcula la distancia entre dos puntos usando la fórmula de Haversine
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calcula el tiempo de preparación del comercio
   */
  private async calculatePreparationTime(
    empresaId: string,
    cantidadItems: number = 1,
  ): Promise<number> {
    // Obtener configuración de la empresa
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
      select: {
        tiempoPreparacionBase: true,
        tiempoExtraPorPedido: true,
        categoriaId: true,
      },
    });

    if (!empresa) {
      // Valores por defecto si no se encuentra la empresa
      return 15;
    }

    // Tiempo base de preparación (configurado por la empresa o 15 min por defecto)
    let tiempoBase = empresa.tiempoPreparacionBase || 15;

    // Contar pedidos activos del comercio para ajustar por congestión
    const pedidosActivos = await this.prisma.pedido.count({
      where: {
        empresaId,
        estado: {
          in: ['pendiente_confirmacion', 'confirmado', 'en_proceso'],
        },
      },
    });

    // Calcular tiempo extra por congestión
    const tiempoExtraPorPedido = empresa.tiempoExtraPorPedido || 2;
    const tiempoCongestión = pedidosActivos * tiempoExtraPorPedido;

    // Ajuste por cantidad de items en el pedido
    const ajustePorItems = Math.max(0, (cantidadItems - 1) * 1); // 1 min extra por cada item adicional

    return tiempoBase + tiempoCongestión + ajustePorItems;
  }

  /**
   * Calcula el tiempo de asignación de repartidor
   */
  private async calculateAssignmentTime(empresaId: string): Promise<number> {
    // Buscar repartidores vinculados a la empresa
    const repartidoresVinculados = await this.prisma.empresaRepartidor.count({
      where: {
        empresaId,
        estado: 'ACEPTADO',
      },
    });

    // Si no hay repartidores vinculados, tiempo de asignación más largo
    if (repartidoresVinculados === 0) {
      return 8; // 8 minutos si no hay repartidores
    }

    // Contar repartidores ocupados (con pedidos en curso)
    const pedidosActivos = await this.prisma.pedido.findMany({
      where: {
        empresaId,
        estado: {
          in: ['esperando_delivery', 'en_camino'],
        },
        repartidorId: { not: null },
      },
      select: {
        repartidorId: true,
      },
    });

    const repartidoresOcupados = new Set(
      pedidosActivos.map((p) => p.repartidorId),
    ).size;

    // Calcular ratio de disponibilidad
    const disponibles = repartidoresVinculados - repartidoresOcupados;

    if (disponibles > 0) {
      return 2; // 2 minutos si hay repartidores disponibles
    } else if (repartidoresVinculados > 0) {
      return 5; // 5 minutos si hay repartidores pero todos ocupados
    }

    return 8; // Por defecto 8 minutos
  }

  /**
   * Calcula el tiempo de llegada del repartidor al comercio
   */
  private async calculatePickupTime(
    empresaId: string,
    empresaLat?: number,
    empresaLng?: number,
  ): Promise<number> {
    // Si no tenemos ubicación del comercio, estimación por defecto
    if (!empresaLat || !empresaLng) {
      return 5; // 5 minutos por defecto
    }

    // Buscar repartidores cercanos disponibles
    // Por ahora, usaremos una estimación promedio
    // En una implementación completa, aquí buscaríamos la ubicación en tiempo real de los repartidores

    // Obtener velocidad promedio de repartidores de la empresa
    const repartidores = await this.prisma.empresaRepartidor.findMany({
      where: {
        empresaId,
        estado: 'ACEPTADO',
      },
      include: {
        repartidor: {
          select: {
            velocidadPromedio: true,
          },
        },
      },
    });

    const velocidadPromedio =
      repartidores.length > 0
        ? repartidores.reduce(
            (sum, r) => sum + (r.repartidor.velocidadPromedio || 25),
            0,
          ) / repartidores.length
        : 25; // 25 km/h por defecto (moto)

    // Estimación: asumimos que el repartidor está a 2 km en promedio
    const distanciaEstimada = 2; // km
    const tiempoEnHoras = distanciaEstimada / velocidadPromedio;
    const tiempoEnMinutos = Math.ceil(tiempoEnHoras * 60);

    return tiempoEnMinutos;
  }

  /**
   * Calcula el tiempo de entrega al cliente
   */
  private async calculateDeliveryTime(
    empresaId: string,
    empresaLat?: number,
    empresaLng?: number,
    clienteLat?: number,
    clienteLng?: number,
  ): Promise<number> {
    // Si no tenemos ubicaciones, estimación por defecto
    if (!empresaLat || !empresaLng || !clienteLat || !clienteLng) {
      return 10; // 10 minutos por defecto
    }

    // Calcular distancia entre comercio y cliente
    const distanciaKm = this.calculateDistance(
      empresaLat,
      empresaLng,
      clienteLat,
      clienteLng,
    );

    // Obtener velocidad promedio de repartidores
    const repartidores = await this.prisma.empresaRepartidor.findMany({
      where: {
        empresaId,
        estado: 'ACEPTADO',
      },
      include: {
        repartidor: {
          select: {
            velocidadPromedio: true,
          },
        },
      },
    });

    const velocidadPromedio =
      repartidores.length > 0
        ? repartidores.reduce(
            (sum, r) => sum + (r.repartidor.velocidadPromedio || 25),
            0,
          ) / repartidores.length
        : 25; // 25 km/h por defecto (moto)

    // Calcular tiempo de viaje
    const tiempoEnHoras = distanciaKm / velocidadPromedio;
    let tiempoEnMinutos = Math.ceil(tiempoEnHoras * 60);

    // Ajuste por hora pico (ejemplo: lunes a viernes 12-14 y 19-21)
    const ahora = new Date();
    const hora = ahora.getHours();
    const diaSemana = ahora.getDay(); // 0 = domingo, 6 = sábado

    const esHoraPico =
      diaSemana >= 1 &&
      diaSemana <= 5 &&
      ((hora >= 12 && hora < 14) || (hora >= 19 && hora < 21));

    if (esHoraPico) {
      tiempoEnMinutos = Math.ceil(tiempoEnMinutos * 1.3); // 30% más de tiempo en hora pico
    }

    // Mínimo 5 minutos
    return Math.max(5, tiempoEnMinutos);
  }

  /**
   * Calcula la estimación completa del tiempo de entrega
   */
  async calculateEstimation(
    params: EstimationParams,
  ): Promise<DeliveryTimeEstimation> {
    const { empresaId, clienteLat, clienteLng, cantidadItems, tipoEntrega } =
      params;

    // Si es retiro, solo calcular tiempo de preparación
    if (tipoEntrega === 'retiro') {
      const preparacionMinutos = await this.calculatePreparationTime(
        empresaId,
        cantidadItems,
      );

      const fechaEntregaEstimada = new Date();
      fechaEntregaEstimada.setMinutes(
        fechaEntregaEstimada.getMinutes() + preparacionMinutos,
      );

      return {
        preparacionMinutos,
        asignacionMinutos: 0,
        recojoMinutos: 0,
        entregaMinutos: 0,
        totalMinutos: preparacionMinutos,
        fechaEntregaEstimada,
        rangoMinimo: Math.max(1, preparacionMinutos - 5),
        rangoMaximo: preparacionMinutos + 10,
      };
    }

    // Obtener ubicación del comercio
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
      include: {
        ubicacion: true,
      },
    });

    const empresaLat = empresa?.ubicacion?.lat;
    const empresaLng = empresa?.ubicacion?.lng;

    // Calcular cada componente del tiempo
    const preparacionMinutos = await this.calculatePreparationTime(
      empresaId,
      cantidadItems,
    );
    const asignacionMinutos = await this.calculateAssignmentTime(empresaId);
    const recojoMinutos = await this.calculatePickupTime(
      empresaId,
      empresaLat || undefined,
      empresaLng || undefined,
    );
    const entregaMinutos = await this.calculateDeliveryTime(
      empresaId,
      empresaLat || undefined,
      empresaLng || undefined,
      clienteLat,
      clienteLng,
    );

    // Calcular total
    const totalMinutos =
      preparacionMinutos + asignacionMinutos + recojoMinutos + entregaMinutos;

    // Calcular fecha estimada de entrega
    const fechaEntregaEstimada = new Date();
    fechaEntregaEstimada.setMinutes(
      fechaEntregaEstimada.getMinutes() + totalMinutos,
    );

    // Calcular rango (±20% del total)
    const margen = Math.ceil(totalMinutos * 0.2);
    const rangoMinimo = Math.max(1, totalMinutos - margen);
    const rangoMaximo = totalMinutos + margen;

    return {
      preparacionMinutos,
      asignacionMinutos,
      recojoMinutos,
      entregaMinutos,
      totalMinutos,
      fechaEntregaEstimada,
      rangoMinimo,
      rangoMaximo,
    };
  }

  /**
   * Actualiza los tiempos estimados de un pedido existente
   */
  async updateOrderEstimation(pedidoId: string): Promise<void> {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        ItemPedido: true,
      },
    });

    if (!pedido) {
      return;
    }

    const estimacion = await this.calculateEstimation({
      empresaId: pedido.empresaId,
      clienteLat: pedido.lat || undefined,
      clienteLng: pedido.lng || undefined,
      cantidadItems: pedido.ItemPedido.length,
      tipoEntrega: pedido.tipoEntrega as 'delivery' | 'retiro',
    });

    // Actualizar el pedido con la estimación
    await this.prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        tiempoPreparacionEstimado: estimacion.preparacionMinutos,
        tiempoAsignacionEstimado: estimacion.asignacionMinutos,
        tiempoRecojoEstimado: estimacion.recojoMinutos,
        tiempoEntregaEstimado: estimacion.entregaMinutos,
        tiempoTotalEstimado: estimacion.totalMinutos,
        fechaEntregaEstimada: estimacion.fechaEntregaEstimada,
      },
    });
  }
}
