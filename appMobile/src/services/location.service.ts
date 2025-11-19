/**
 * Location Service
 * Servicio para gestionar ubicaciones guardadas del cliente
 */

import api from '../config/axios.config';

export interface SavedLocation {
  id: number;
  clienteId: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  referencia?: string;
  esPrincipal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationDto {
  clienteId: string | undefined;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  referencia?: string;
  esPrincipal?: boolean;
}

export interface UpdateLocationDto {
  nombre?: string;
  direccion?: string;
  lat?: number;
  lng?: number;
  referencia?: string;
  esPrincipal?: boolean;
}

export const locationService = {
  /**
   * Obtener todas las ubicaciones guardadas
   */
  async getAll(): Promise<SavedLocation[]> {
    const response = await api.get<SavedLocation[]>('/ubicaciones-cliente');
    return response.data;
  },

  /**
   * Obtener la ubicación principal
   */
  async getPrincipal(): Promise<SavedLocation | null> {
    try {
      const response = await api.get<SavedLocation>('/ubicaciones-cliente/principal');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Obtener una ubicación por ID
   */
  async getById(id: number): Promise<SavedLocation> {
    const response = await api.get<SavedLocation>(`/ubicaciones-cliente/${id}`);
    return response.data;
  },

  /**
   * Crear una nueva ubicación
   */
  async create(data: CreateLocationDto): Promise<SavedLocation> {
    const response = await api.post<SavedLocation>('/ubicaciones-cliente', data);
    return response.data;
  },

  /**
   * Actualizar una ubicación existente
   */
  async update(id: number, data: UpdateLocationDto): Promise<SavedLocation> {
    const response = await api.put<SavedLocation>(`/ubicaciones-cliente/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar una ubicación
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/ubicaciones-cliente/${id}`);
  },

  /**
   * Establecer una ubicación como principal
   */
  async setAsPrincipal(id: number): Promise<SavedLocation> {
    const response = await api.put<SavedLocation>(`/ubicaciones-cliente/${id}/principal`);
    return response.data;
  },
};
