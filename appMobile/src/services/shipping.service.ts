/**
 * Shipping Service
 * Servicio para calcular precios de envío y tiempos de entrega
 */

import api from '../config/axios.config';
import type { ShippingPriceResponse, DeliveryLocation } from '../types/order';
import type { DeliveryTimeEstimation } from '../types/cart';

export interface CalculateShippingPriceRequest {
  clienteLat: number;
  clienteLng: number;
  ubicacionId: number;
}

export interface EstimateDeliveryTimeRequest {
  empresaId: string;
  clienteLat?: number;
  clienteLng?: number;
  cantidadItems?: number;
  tipoEntrega: 'delivery' | 'retiro';
}

class ShippingService {
  /**
   * Calcula el precio de envío basado en la ubicación del cliente
   */
  async calculateShippingPrice(
    empresaId: string,
    request: CalculateShippingPriceRequest
  ): Promise<ShippingPriceResponse> {
    try {
      const response = await api.post(
        `/empresas/${empresaId}/calcular-precio-envio`,
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('Error calculating shipping price:', error);

      // Si falla, devolver un precio estimado
      return {
        price: null,
        isEstimated: true,
        message: 'No se pudo calcular el precio exacto. El vendedor te contactará.',
      };
    }
  }

  /**
   * Calcula el tiempo estimado de entrega
   */
  async estimateDeliveryTime(
    request: EstimateDeliveryTimeRequest
  ): Promise<DeliveryTimeEstimation | null> {
    try {
      const response = await api.post(
        `/pedidos/estimate-delivery-time`,
        request
      );

      // Convertir fecha string a Date
      return {
        ...response.data,
        fechaEntregaEstimada: new Date(response.data.fechaEntregaEstimada),
      };
    } catch (error: any) {
      console.error('Error estimating delivery time:', error);

      // Si falla, devolver null (el componente manejará la ausencia de estimación)
      return null;
    }
  }

  /**
   * Calcula la estimación local de tiempo de entrega (sin llamar al backend)
   * Útil para dar feedback inmediato al usuario
   */
  estimateDeliveryTimeLocal(
    tipoEntrega: 'delivery' | 'retiro',
    distanciaKm?: number,
    cantidadItems: number = 1
  ): DeliveryTimeEstimation {
    // Tiempo base de preparación
    const preparacionBase = 15;

    // Ajuste por cantidad de items
    const ajustePorItems = Math.max(0, (cantidadItems - 1) * 1);

    const preparacionMinutos = preparacionBase + ajustePorItems;

    if (tipoEntrega === 'retiro') {
      const fechaEstimada = new Date();
      fechaEstimada.setMinutes(fechaEstimada.getMinutes() + preparacionMinutos);

      return {
        preparacionMinutos,
        asignacionMinutos: 0,
        recojoMinutos: 0,
        entregaMinutos: 0,
        totalMinutos: preparacionMinutos,
        fechaEntregaEstimada: fechaEstimada,
        rangoMinimo: Math.max(1, preparacionMinutos - 5),
        rangoMaximo: preparacionMinutos + 10,
      };
    }

    // Para delivery
    const asignacionMinutos = 3; // Estimación promedio
    const recojoMinutos = 5; // Estimación promedio

    // Calcular tiempo de entrega basado en distancia
    let entregaMinutos = 10; // Por defecto
    if (distanciaKm !== undefined) {
      const velocidadPromedio = 25; // km/h (moto)
      const tiempoEnHoras = distanciaKm / velocidadPromedio;
      entregaMinutos = Math.max(5, Math.ceil(tiempoEnHoras * 60));
    }

    const totalMinutos = preparacionMinutos + asignacionMinutos + recojoMinutos + entregaMinutos;

    const fechaEstimada = new Date();
    fechaEstimada.setMinutes(fechaEstimada.getMinutes() + totalMinutos);

    const margen = Math.ceil(totalMinutos * 0.2);

    return {
      preparacionMinutos,
      asignacionMinutos,
      recojoMinutos,
      entregaMinutos,
      totalMinutos,
      fechaEntregaEstimada: fechaEstimada,
      rangoMinimo: Math.max(1, totalMinutos - margen),
      rangoMaximo: totalMinutos + margen,
    };
  }

  /**
   * Calcula la distancia entre dos puntos usando la fórmula de Haversine
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Encuentra la ubicación más cercana de la empresa
   */
  findClosestLocation(
    clientLocation: DeliveryLocation,
    companyLocations: Array<{ id: string; lat: number; lng: number; direccion: string }>
  ): { id: string; lat: number; lng: number; direccion: string; distance: number } | null {
    if (!companyLocations || companyLocations.length === 0) {
      return null;
    }

    const distances = companyLocations.map((location) => {
      const distance = this.calculateDistance(
        clientLocation.lat,
        clientLocation.lng,
        location.lat,
        location.lng
      );
      return { ...location, distance };
    });

    return distances.reduce((prev, current) =>
      prev.distance < current.distance ? prev : current
    );
  }
}

export const shippingService = new ShippingService();