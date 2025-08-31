import { useState, useEffect } from 'react';
import { useAuthOptimized } from '../../../../../hooks/useAuthOptimized';
import productosService, { CreateProductoDto, UpdateProductoDto } from '../../../../../services/productosService';
import { ProductWithExtras, ProductsStats } from '../types';

export const useProducts = () => {
  const { user } = useAuthOptimized();
  const [products, setProducts] = useState<ProductWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProductsStats>({
    total: 0,
    activos: 0,
    inactivos: 0
  });

  // Cargar productos al montar el componente
  useEffect(() => {
    if (user?.id) {
      loadProducts();
    }
  }, [user?.id]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [PRODUCTS HOOK] Cargando productos para empresa:', user?.id);
      
      const [productosData, statsData] = await Promise.all([
        productosService.getProductosByEmpresa(user!.id),
        productosService.getProductosStats(user!.id)
      ]);
      
      // Validar que productosData sea un array
      const validProductosData = Array.isArray(productosData) ? productosData : [];
      
      // Convertir productos del backend al formato del frontend
      const productsWithExtras: ProductWithExtras[] = validProductosData.map(producto => ({
        ...producto,
        // Asegurar que los campos requeridos existan
        nombre: producto.nombre || 'Producto sin nombre',
        descripcion: producto.descripcion || '',
        precio: producto.precio || 0,
        // Campos simulados para UI (no existen en backend)
        category: 'General', // Simulado
        createdAt: producto.createdAt || new Date().toISOString()
      }));
      
      setProducts(productsWithExtras);
      setStats(statsData);
      
      console.log('✅ [PRODUCTS HOOK] Productos cargados exitosamente:', {
        count: productsWithExtras.length,
        stats: statsData
      });
    } catch (err: any) {
      console.error('❌ [PRODUCTS HOOK] Error al cargar productos:', err);
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (productData: {
    nombre: string;
    descripcion: string;
    precio: number;
    activo: boolean;
    file?: File;
  }, editingProduct?: ProductWithExtras | null) => {
    try {
      if (!user?.id) throw new Error('Usuario no autenticado');

      if (editingProduct) {
        // Actualizar producto existente
        const updateData: UpdateProductoDto = {
          nombre: productData.nombre,
          descripcion: productData.descripcion,
          precio: productData.precio,
          activo: productData.activo,
        };

        // Usar el método que maneja automáticamente el borrado de imagen anterior
        const updatedProduct = await productosService.updateProductoWithImage(
          editingProduct.id, 
          updateData,
          productData.file
        );

        setProducts(products.map(p =>
          p.id === editingProduct.id
            ? { ...p, ...updatedProduct, category: p.category }
            : p
        ));
      } else {
        // Crear nuevo producto
        const createData: CreateProductoDto = {
          nombre: productData.nombre,
          descripcion: productData.descripcion,
          precio: productData.precio,
          empresaId: user.id,
          activo: productData.activo,
        };

        // Usar el método que maneja automáticamente la subida de imagen
        const newProduct = await productosService.createProductoWithImage(createData, productData.file);
        const newProductWithExtras: ProductWithExtras = {
          ...newProduct,
          category: 'General',
        };
        setProducts([...products, newProductWithExtras]);
      }

      const newStats = await productosService.getProductosStats(user.id);
      setStats(newStats);

    } catch (err: any) {
      console.error('❌ Error al guardar producto:', err);
      throw err;
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        console.log('🗑️ [PRODUCTS HOOK] Eliminando producto:', productId);
        
        await productosService.deleteProducto(productId);
        
        // Actualizar la lista local
        setProducts(products.filter(p => p.id !== productId));
        
        // Recargar estadísticas
        if (user?.id) {
          const newStats = await productosService.getProductosStats(user.id);
          setStats(newStats);
        }
        
        console.log('✅ [PRODUCTS HOOK] Producto eliminado exitosamente');
      } catch (err: any) {
        console.error('❌ [PRODUCTS HOOK] Error al eliminar producto:', err);
        alert(err.message || 'Error al eliminar producto');
      }
    }
  };

  return {
    products,
    loading,
    error,
    stats,
    user,
    loadProducts,
    handleSaveProduct,
    handleDeleteProduct
  };
};
