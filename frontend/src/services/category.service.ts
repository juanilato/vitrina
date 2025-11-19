import axiosInstance from '../config/axios.config';

export interface CategoriaProducto {
  id: string;
  nombre: string;
  empresaId: string;
  icono?: string;
  orden: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    productos: number;
  };
}

export interface CreateCategoriaProductoDto {
  nombre: string;
  empresaId?: string; // Opcional, se toma del usuario autenticado
  icono?: string;
  orden?: number;
  activo?: boolean;
}

export interface UpdateCategoriaProductoDto {
  nombre?: string;
  icono?: string;
  orden?: number;
  activo?: boolean;
}

class CategoryService {
  // Obtener todas las categorías de una empresa
  async getByEmpresa(empresaId: string): Promise<CategoriaProducto[]> {
    const response = await axiosInstance.get(`/categorias-producto/empresa/${empresaId}`);
    return response.data;
  }

  // Crear una categoría
  async create(data: CreateCategoriaProductoDto): Promise<CategoriaProducto> {
    const response = await axiosInstance.post('/categorias-producto', data);
    return response.data;
  }

  // Actualizar una categoría
  async update(id: string, data: UpdateCategoriaProductoDto): Promise<CategoriaProducto> {
    const response = await axiosInstance.patch(`/categorias-producto/${id}`, data);
    return response.data;
  }

  // Eliminar una categoría
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/categorias-producto/${id}`);
  }

  // Obtener estadísticas
  async getStats(empresaId: string): Promise<{ total: number; activas: number; inactivas: number }> {
    const response = await axiosInstance.get(`/categorias-producto/stats/${empresaId}`);
    return response.data;
  }

  // Reordenar categorías
  async reorder(empresaId: string, categoriaIds: string[]): Promise<void> {
    await axiosInstance.post(`/categorias-producto/reorder/${empresaId}`, { categoriaIds });
  }
}

export default new CategoryService();
