import { ShippingPriceResponse, DeliveryLocation } from '../components/client/types';
import axiosInstance from '../config/axios.config';

export interface CalculateShippingPriceRequest {
  clienteLat: number;
  clienteLng: number;
  ubicacionId: number;
}

export class ShippingService {
  static async calculateShippingPrice(
    empresaId: string,
    request: CalculateShippingPriceRequest
  ): Promise<ShippingPriceResponse> {
    try {
      const response = await axiosInstance.post(
        `/empresas/${empresaId}/calcular-precio-envio`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating shipping price:', error);
      throw error;
    }
  }

  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static findClosestLocation(
    clientLocation: DeliveryLocation,
    companyLocations: Array<{ id: number; lat: number; lng: number; direccion: string }>
  ): { id: number; lat: number; lng: number; direccion: string; distance: number } {
    const distances = companyLocations.map(location => {
      const distance = this.calculateDistance(
        clientLocation.lat, clientLocation.lng,
        location.lat, location.lng
      );
      return { ...location, distance };
    });

    return distances.reduce((prev, current) => 
      prev.distance < current.distance ? prev : current
    );
  }
}
