import axiosInstance from '../config/axios.config';

export interface SavedLocation {
  id: number;
  clienteId: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  referencia?: string;
  esPrincipal: boolean;
  esFavorita?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationDto {
  clienteId: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  referencia?: string;
  esPrincipal?: boolean;
  esFavorita?: boolean;
}

export interface UpdateLocationDto {
  nombre?: string;
  direccion?: string;
  lat?: number;
  lng?: number;
  referencia?: string;
  esPrincipal?: boolean;
  esFavorita?: boolean;
}

export class LocationService {
  /**
   * Obtener todas las ubicaciones del cliente
   */
  static async getAll(): Promise<SavedLocation[]> {
    try {
      const response = await axiosInstance.get('/ubicaciones-cliente');
      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  /**
   * Obtener la ubicación principal del cliente
   */
  static async getPrincipal(): Promise<SavedLocation | null> {
    try {
      const response = await axiosInstance.get('/ubicaciones-cliente/principal');
      return response.data;
    } catch (error) {
      console.error('Error fetching principal location:', error);
      return null;
    }
  }

  /**
   * Obtener una ubicación por ID
   */
  static async getById(id: number): Promise<SavedLocation> {
    try {
      const response = await axiosInstance.get(`/ubicaciones-cliente/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching location:', error);
      throw error;
    }
  }

  /**
   * Crear una nueva ubicación
   */
  static async create(data: CreateLocationDto): Promise<SavedLocation> {
    try {
      const response = await axiosInstance.post('/ubicaciones-cliente', data);
      return response.data;
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  }

  /**
   * Actualizar una ubicación existente
   */
  static async update(id: number, data: UpdateLocationDto): Promise<SavedLocation> {
    try {
      const response = await axiosInstance.put(`/ubicaciones-cliente/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  /**
   * Eliminar una ubicación
   */
  static async delete(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/ubicaciones-cliente/${id}`);
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }

  /**
   * Establecer una ubicación como principal
   */
  static async setPrincipal(id: number): Promise<SavedLocation> {
    try {
      const response = await axiosInstance.put(`/ubicaciones-cliente/${id}/principal`);
      return response.data;
    } catch (error) {
      console.error('Error setting principal location:', error);
      throw error;
    }
  }

  /**
   * Marcar/desmarcar una ubicación como favorita
   */
  static async toggleFavorite(id: number, esFavorita: boolean): Promise<SavedLocation> {
    try {
      const response = await axiosInstance.put(`/ubicaciones-cliente/${id}`, { esFavorita });
      return response.data;
    } catch (error) {
      console.error('Error toggling favorite location:', error);
      throw error;
    }
  }
}
