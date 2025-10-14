// src/services/ingredientesService.ts (Nuevo archivo)

import axiosInstance from '../config/axios.config';
// Asume la existencia de estos tipos
import { IngredienteWithExtras, CreateIngredienteDto, UpdateIngredienteDto, IngredienteStats } from '../components/dashboard/sections/IngredientsSection/types';

/**
 * Servicio para interactuar con la API de Ingredientes.
 * * Basado en la estructura de PedidosService y adaptado a la lógica CRUD simple de Inventario.
 */


class IngredientesService {
  private baseURL = '/ingredientes'; // Ruta base de la API para ingredientes

  // 1. Obtener todos los ingredientes de una empresa
  async getIngredientesByEmpresa(empresaId: string): Promise<IngredienteWithExtras[]> {
    try {
      console.log('🔄 [INGREDIENTES SERVICE] Obteniendo ingredientes para empresa:', empresaId);
      
      const response = await axiosInstance.get(`${this.baseURL}`);
      
      console.log('✅ [INGREDIENTES SERVICE] Ingredientes obtenidos exitosamente:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ [INGREDIENTES SERVICE] Error al obtener ingredientes:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener ingredientes');
    }
  }

  // 2. Obtener un ingrediente por ID
  async getIngredienteById(ingredienteId: string): Promise<IngredienteWithExtras> {
    try {
      console.log('🔄 [INGREDIENTES SERVICE] Obteniendo ingrediente:', ingredienteId);
      
      const response = await axiosInstance.get(`${this.baseURL}/${ingredienteId}`);
      
      console.log('✅ [INGREDIENTES SERVICE] Ingrediente obtenido exitosamente:', response.data.nombre);
      return response.data;
    } catch (error: any) {
      console.error('❌ [INGREDIENTES SERVICE] Error al obtener ingrediente:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener ingrediente');
    }
  }

  // 3. Crear un nuevo ingrediente
  async createIngrediente(ingredienteData: CreateIngredienteDto): Promise<IngredienteWithExtras> {
    try {
      console.log('🔄 [INGREDIENTES SERVICE] Creando ingrediente:', ingredienteData.nombre);
      
      const response = await axiosInstance.post(this.baseURL, ingredienteData);
      
      console.log('✅ [INGREDIENTES SERVICE] Ingrediente creado exitosamente:', response.data.nombre);
      return response.data;
    } catch (error: any) {
      console.error('❌ [INGREDIENTES SERVICE] Error al crear ingrediente:', error);
      throw new Error(error.response?.data?.message || 'Error al crear ingrediente');
    }
  }

  // 4. Actualizar un ingrediente
  async updateIngrediente(ingredienteId: string, updateData: UpdateIngredienteDto): Promise<IngredienteWithExtras> {
    try {
      console.log('🔄 [INGREDIENTES SERVICE] Actualizando ingrediente:', ingredienteId);
      
      const response = await axiosInstance.patch(`${this.baseURL}/${ingredienteId}`, updateData);
      
      console.log('✅ [INGREDIENTES SERVICE] Ingrediente actualizado exitosamente:', response.data.nombre);
      return response.data;
    } catch (error: any) {
      console.error('❌ [INGREDIENTES SERVICE] Error al actualizar ingrediente:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar ingrediente');
    }
  }

  // 5. Eliminar un ingrediente
  async deleteIngrediente(ingredienteId: string): Promise<void> {
    try {
      console.log('🔄 [INGREDIENTES SERVICE] Eliminando ingrediente:', ingredienteId);
      
      await axiosInstance.delete(`${this.baseURL}/${ingredienteId}`);
      
      console.log('✅ [INGREDIENTES SERVICE] Ingrediente eliminado exitosamente');
    } catch (error: any) {
      console.error('❌ [INGREDIENTES SERVICE] Error al eliminar ingrediente:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar ingrediente');
    }
  }

  // 6. Obtener estadísticas de ingredientes (ej: total, en stock, agotados, total de unidades)
  
  async getIngredientesStats(empresaId: string): Promise<IngredienteStats> {
    try {
      console.log('🔄 [INGREDIENTES SERVICE] Obteniendo estadísticas para empresa:', empresaId);
      
      const response = await axiosInstance.get(`${this.baseURL}/stats/${empresaId}`);
      
      console.log('✅ [INGREDIENTES SERVICE] Estadísticas de ingredientes obtenidas exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ [INGREDIENTES SERVICE] Error al obtener estadísticas de ingredientes:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de ingredientes');
    }
  }

  // ** NOTA: Métodos específicos de Pedidos eliminados (getStatusColor, getStatusText, getNextStatus) **
  // Los ingredientes no tienen estados de flujo de pedidos.
}

const ingredientesService = new IngredientesService();
export default ingredientesService;