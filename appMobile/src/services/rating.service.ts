/**
 * Servicio para manejar valoraciones de pedidos
 */

import api from '../config/axios.config';
import {
  CreateValoracionData,
  Valoracion,
  CanRateResponse,
  PromedioValoracion,
} from '../types/rating';

class RatingService {
  /**
   * Crear una nueva valoración
   */
  async createRating(data: CreateValoracionData): Promise<Valoracion> {
    const response = await api.post<Valoracion>('/valoraciones', data);
    return response.data;
  }

  /**
   * Verificar si un pedido puede ser valorado
   */
  async canRateOrder(pedidoId: string): Promise<CanRateResponse> {
    try {
      const response = await api.get<CanRateResponse>(`/valoraciones/can-rate/${pedidoId}`);
      return response.data;
    } catch (error) {
      return { canRate: false, reason: 'Error al verificar' };
    }
  }

  /**
   * Obtener valoración de un pedido específico
   */
  async getRatingByOrder(pedidoId: string): Promise<Valoracion | null> {
    try {
      const response = await api.get<Valoracion>(`/valoraciones/pedido/${pedidoId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo valoración:', error);
      return null;
    }
  }

  /**
   * Obtener todas las valoraciones del cliente autenticado
   */
  async getMyRatings(): Promise<Valoracion[]> {
    const response = await api.get<Valoracion[]>('/valoraciones/mis-valoraciones');
    return response.data;
  }

  /**
   * Obtener valoraciones de una empresa
   */
  async getCompanyRatings(
    empresaId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    valoraciones: Valoracion[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await api.get(
      `/valoraciones/empresa/${empresaId}?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  /**
   * Obtener promedio de calificaciones de una empresa
   */
  async getCompanyAverage(empresaId: string): Promise<PromedioValoracion> {
    try {
      const response = await api.get<PromedioValoracion>(
        `/valoraciones/empresa/${empresaId}/promedio`
      );
      return response.data;
    } catch (error) {
      return { promedio: 0, totalValoraciones: 0 };
    }
  }

  /**
   * Actualizar una valoración existente
   */
  async updateRating(
    valoracionId: string,
    data: Partial<CreateValoracionData>
  ): Promise<Valoracion> {
    const response = await api.patch<Valoracion>(`/valoraciones/${valoracionId}`, data);
    return response.data;
  }
}

export default new RatingService();
