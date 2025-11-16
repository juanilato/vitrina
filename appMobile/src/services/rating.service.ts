/**
 * Servicio para manejar valoraciones de pedidos
 */

import { API_URL } from '../utils/constants';
import {
  CreateValoracionData,
  Valoracion,
  CanRateResponse,
  PromedioValoracion,
} from '../types/rating';
import { getAuthToken } from '../utils/auth';

class RatingService {
  /**
   * Crear una nueva valoración
   */
  async createRating(data: CreateValoracionData): Promise<Valoracion> {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/valoraciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear valoración');
    }

    return response.json();
  }

  /**
   * Verificar si un pedido puede ser valorado
   */
  async canRateOrder(pedidoId: string): Promise<CanRateResponse> {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/valoraciones/can-rate/${pedidoId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { canRate: false, reason: 'Error al verificar' };
    }

    return response.json();
  }

  /**
   * Obtener valoración de un pedido específico
   */
  async getRatingByOrder(pedidoId: string): Promise<Valoracion | null> {
    try {
      const response = await fetch(`${API_URL}/valoraciones/pedido/${pedidoId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error obteniendo valoración:', error);
      return null;
    }
  }

  /**
   * Obtener todas las valoraciones del cliente autenticado
   */
  async getMyRatings(): Promise<Valoracion[]> {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/valoraciones/mis-valoraciones`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener valoraciones');
    }

    return response.json();
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
    const response = await fetch(
      `${API_URL}/valoraciones/empresa/${empresaId}?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener valoraciones de la empresa');
    }

    return response.json();
  }

  /**
   * Obtener promedio de calificaciones de una empresa
   */
  async getCompanyAverage(empresaId: string): Promise<PromedioValoracion> {
    const response = await fetch(`${API_URL}/valoraciones/empresa/${empresaId}/promedio`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { promedio: 0, totalValoraciones: 0 };
    }

    return response.json();
  }

  /**
   * Actualizar una valoración existente
   */
  async updateRating(
    valoracionId: string,
    data: Partial<CreateValoracionData>
  ): Promise<Valoracion> {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/valoraciones/${valoracionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar valoración');
    }

    return response.json();
  }
}

export default new RatingService();
