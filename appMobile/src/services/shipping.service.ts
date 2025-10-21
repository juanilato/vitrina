/**
 * Shipping Service
 * Servicio para calcular precios de envío
 */

import api from '../config/axios.config';
import type { ShippingPriceResponse, DeliveryLocation } from '../types/order';

export interface CalculateShippingPriceRequest {
  clienteLat: number;
  clienteLng: number;
  ubicacionId: number;
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