import axiosInstance from '../config/axios.config';

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  empresaId: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductoDto {
  nombre: string;
  descripcion?: string;
  precio: number;
  empresaId: string;
  activo?: boolean;
  fotoUrl?: string;
}

export interface UpdateProductoDto {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  activo?: boolean;
  fotoUrl?: string;
}

class ProductosService {
  private baseURL = '/productos';

  /**
   * Obtener todos los productos de una empresa
   */
  async getProductosByEmpresa(empresaId: string): Promise<Producto[]> {
    try {
      console.log('🔍 [PRODUCTOS SERVICE] Obteniendo productos para empresa:', empresaId);
      
      const response = await axiosInstance.get(`${this.baseURL}?empresaId=${empresaId}`);
      
      // Validar que la respuesta sea un array
      const productos = Array.isArray(response.data) ? response.data : [];
      
      console.log('✅ [PRODUCTOS SERVICE] Productos obtenidos:', {
        count: productos.length,
        productos: productos
      });
      
      return productos;
    } catch (error: any) {
      console.error('❌ [PRODUCTOS SERVICE] Error al obtener productos:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Error al obtener productos');
    }
  }

  /**
   * Obtener un producto específico por ID
   */
  async getProductoById(id: string): Promise<Producto> {
    try {
      console.log('🔍 [PRODUCTOS SERVICE] Obteniendo producto por ID:', id);
      
      const response = await axiosInstance.get(`${this.baseURL}/${id}`);
      
      console.log('✅ [PRODUCTOS SERVICE] Producto obtenido:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [PRODUCTOS SERVICE] Error al obtener producto:', {
        id,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Error al obtener producto');
    }
  }

  /**
   * Crear un nuevo producto
   */
  async createProducto(productoData: CreateProductoDto): Promise<Producto> {
    try {
      console.log('📝 [PRODUCTOS SERVICE] Creando nuevo producto:', productoData);
      
      const response = await axiosInstance.post(this.baseURL, productoData);
      
      console.log('✅ [PRODUCTOS SERVICE] Producto creado exitosamente:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [PRODUCTOS SERVICE] Error al crear producto:', {
        productoData,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Error al crear producto');
    }
  }

  /**
   * Actualizar un producto existente
   */
  async updateProducto(id: string, updateData: UpdateProductoDto): Promise<Producto> {
    try {
      console.log('✏️ [PRODUCTOS SERVICE] Actualizando producto:', { id, updateData });
      
      const response = await axiosInstance.patch(`${this.baseURL}/${id}`, updateData);
      
      console.log('✅ [PRODUCTOS SERVICE] Producto actualizado exitosamente:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [PRODUCTOS SERVICE] Error al actualizar producto:', {
        id,
        updateData,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Error al actualizar producto');
    }
  }

  /**
   * Eliminar un producto
   */
  async deleteProducto(id: string): Promise<void> {
    try {
      console.log('🗑️ [PRODUCTOS SERVICE] Eliminando producto:', id);
      
      await axiosInstance.delete(`${this.baseURL}/${id}`);
      
      console.log('✅ [PRODUCTOS SERVICE] Producto eliminado exitosamente');
    } catch (error: any) {
      console.error('❌ [PRODUCTOS SERVICE] Error al eliminar producto:', {
        id,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Error al eliminar producto');
    }
  }

  /**
   * Subir imagen de producto al backend
   */
  async uploadImage(file: File, empresaId: string): Promise<{fotoUrl: string, fotoPath: string, message: string}> {
    try {
      console.log('📤 [PRODUCTOS SERVICE] Subiendo imagen:', { fileName: file.name, empresaId });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('empresaId', empresaId);
      
      const response = await axiosInstance.post(`${this.baseURL}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ [PRODUCTOS SERVICE] Imagen subida exitosamente:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [PRODUCTOS SERVICE] Error al subir imagen:', {
        fileName: file.name,
        empresaId,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Error al subir imagen');
    }
  }

  /**
   * Crear producto con imagen (maneja la subida automáticamente)
   */
  async createProductoWithImage(productoData: CreateProductoDto, file?: File): Promise<Producto> {
    try {
      console.log('📝 [PRODUCTOS SERVICE] Creando producto con imagen:', { productoData, hasFile: !!file });

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('nombre', productoData.nombre);
        formData.append('descripcion', productoData.descripcion || '');
        formData.append('precio', productoData.precio.toString());
        formData.append('empresaId', productoData.empresaId);
        formData.append('activo', productoData.activo?.toString() || 'true');

        const response = await axiosInstance.post(`${this.baseURL}/create-with-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('✅ [PRODUCTOS SERVICE] Producto con imagen creado exitosamente:', response.data);
        return response.data;
      } else {
        // Si no hay archivo, usar el método normal
        return this.createProducto(productoData);
      }
    } catch (error: any) {
      console.error('❌ [PRODUCTOS SERVICE] Error al crear producto con imagen:', {
        productoData,
        hasFile: !!file,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Error al crear producto con imagen');
    }
  }

  /**
   * Actualizar producto con imagen (borra la anterior automáticamente)
   */
  async updateProductoWithImage(id: string, updateData: UpdateProductoDto, file?: File): Promise<Producto> {
    try {
      console.log('✏️ [PRODUCTOS SERVICE] Actualizando producto con imagen:', { id, updateData, hasFile: !!file });

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        if (updateData.nombre) formData.append('nombre', updateData.nombre);
        if (updateData.descripcion !== undefined) formData.append('descripcion', updateData.descripcion);
        if (updateData.precio !== undefined) formData.append('precio', updateData.precio.toString());
        if (updateData.activo !== undefined) formData.append('activo', updateData.activo.toString());

        const response = await axiosInstance.patch(`${this.baseURL}/${id}/update-with-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('✅ [PRODUCTOS SERVICE] Producto con imagen actualizado exitosamente:', response.data);
        return response.data;
      } else {
        // Si no hay archivo, usar el método normal
        return this.updateProducto(id, updateData);
      }
    } catch (error: any) {
      console.error('❌ [PRODUCTOS SERVICE] Error al actualizar producto con imagen:', {
        id,
        updateData,
        hasFile: !!file,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Error al actualizar producto con imagen');
    }
  }

  /**
   * Obtener estadísticas de productos de una empresa
   */
  async getProductosStats(empresaId: string) {
    try {
      console.log('📊 [PRODUCTOS SERVICE] Obteniendo estadísticas para empresa:', empresaId);
      
      const response = await axiosInstance.get(`${this.baseURL}/stats/${empresaId}`);
      
      console.log('✅ [PRODUCTOS SERVICE] Estadísticas obtenidas:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [PRODUCTOS SERVICE] Error al obtener estadísticas:', {
        empresaId,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      // Fallback: calcular estadísticas localmente
      try {
        const productos = await this.getProductosByEmpresa(empresaId);
        const activos = productos.filter(p => p.activo).length;
        const inactivos = productos.filter(p => !p.activo).length;
        
        return {
          total: productos.length,
          activos: activos,
          inactivos: inactivos
        };
      } catch {
        return {
          total: 0,
          activos: 0,
          inactivos: 0
        };
      }
    }
  }
}

// Exportar una instancia singleton
export const productosService = new ProductosService();
export default productosService;
