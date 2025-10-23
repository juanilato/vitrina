// src/features/ingredientes/hooks/useIngredientes.ts

import { useState, useEffect } from 'react';
import { useAuthOptimized } from '../../../../../hooks/useAuthOptimized';
import ingredientesService from '../../../../../services/ingredientesService'; 
import { IngredienteWithExtras, IngredienteStats, CreateIngredienteDto, 
  UpdateIngredienteDto } from '../types';
import { ProductoIngrediente } from '../../ProductsSection/types';

export const useIngredientes = () => {
  const { user } = useAuthOptimized();
  const [ingredientes, setIngredientes] = useState<IngredienteWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<IngredienteStats>({
    total: 0,
    unidades: 0,
    tiposUnicos: 0 // Usaremos total aquí por simplicidad
  });

  useEffect(() => {
    if (user?.id) {
      loadIngredientes();
    }
  }, [user?.id]);

  const loadIngredientes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [INGREDIENTES HOOK] Cargando ingredientes para empresa:', user?.id);
      
      // Asume que tienes un servicio de ingredientes similar al de productos
      const [ingredientesData, statsData] = await Promise.all([
        ingredientesService.getIngredientesByEmpresa(user!.id),
        ingredientesService.getIngredientesStats(user!.id)
      ]);
      
      const validIngredientesData = Array.isArray(ingredientesData) ? ingredientesData : [];
      
      const ingredientesWithExtras: IngredienteWithExtras[] = validIngredientesData.map(ingrediente => ({
        ...ingrediente,
        // Asegurar campos y añadir extras (como el icono)
        nombre: ingrediente.nombre || 'Ingrediente sin nombre',
        stockDisponible: ingrediente.stockDisponible || 0,
        unidadMedida: ingrediente.unidadMedida || 'unidades',
        // El campo 'icono' ya debe venir del backend, si no, usa un default
        icono: ingrediente.icono || 'Grass' 
      }));
      
      setIngredientes(ingredientesWithExtras);
      setStats(statsData); // El backend debe retornar la estructura correcta
      
      console.log('✅ [INGREDIENTES HOOK] Ingredientes cargados exitosamente:', {
        count: ingredientesWithExtras.length,
        stats: statsData
      });
    } catch (err: any) {
      console.error('❌ [INGREDIENTES HOOK] Error al cargar ingredientes:', err);
      setError(err.message || 'Error al cargar ingredientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIngrediente = async (ingredienteData: {
    nombre: string;
    stockDisponible: number;
    unidadMedida: string;
    icono?: string;
  }, editingIngrediente?: IngredienteWithExtras | null) => {
    try {
      if (!user?.id) throw new Error('Usuario no autenticado');

      if (editingIngrediente) {
        // Actualizar ingrediente existente
        const updateData: UpdateIngredienteDto = {
          nombre: ingredienteData.nombre,
          stockDisponible: ingredienteData.stockDisponible,
          unidadMedida: ingredienteData.unidadMedida,
          icono: ingredienteData.icono,
        };

        const updatedIngrediente = await ingredientesService.updateIngrediente(
          editingIngrediente.id, 
          updateData
        );

        setIngredientes(ingredientes.map(i =>
          i.id === editingIngrediente.id
            ? { ...i, ...updatedIngrediente }
            : i
        ));
      } else {
        // Crear nuevo ingrediente
        const createData: CreateIngredienteDto = {
          nombre: ingredienteData.nombre,
          stockDisponible: ingredienteData.stockDisponible,
          unidadMedida: ingredienteData.unidadMedida,
          empresaId: user.id,
          icono: ingredienteData.icono,
        };

        const newIngrediente = await ingredientesService.createIngrediente(createData);
        const newIngredienteWithExtras: IngredienteWithExtras = {
          ...newIngrediente,
          icono: newIngrediente.icono || 'Grass',
        };
        setIngredientes([...ingredientes, newIngredienteWithExtras]);
      }

      const newStats = await ingredientesService.getIngredientesStats(user.id);
      setStats(newStats);

    } catch (err: any) {
      console.error('❌ Error al guardar ingrediente:', err);
      throw err;
    }
  };

  const handleDeleteIngrediente = async (ingredienteId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este ingrediente?')) {
      try {
        console.log('🗑️ [INGREDIENTES HOOK] Eliminando ingrediente:', ingredienteId);
        
        await ingredientesService.deleteIngrediente(ingredienteId);
        
        setIngredientes(ingredientes.filter(i => i.id !== ingredienteId));
        
        if (user?.id) {
          const newStats = await ingredientesService.getIngredientesStats(user.id);
          setStats(newStats);
        }
        
        console.log('✅ [INGREDIENTES HOOK] Ingrediente eliminado exitosamente');
      } catch (err: any) {
        console.error('❌ [INGREDIENTES HOOK] Error al eliminar ingrediente:', err);
        alert(err.message || 'Error al eliminar ingrediente');
      }
    }
  };

  // Funciones para manejar ingredientes en productos
  const addIngredienteToProduct = (
    productoIngredientes: ProductoIngrediente[],
    ingredienteId: string,
    cantidadRequerida: number,
    esExtraPermitido: boolean,
    precioExtra?: number,
    minimoExtra?: number,
    maximoExtra?: number
  ): ProductoIngrediente[] => {
    // Buscar el ingrediente en la lista de ingredientes disponibles
    const ingrediente = ingredientes.find(ing => ing.id === ingredienteId);

    if (!ingrediente) {
      throw new Error('Ingrediente no encontrado');
    }

    // Verificar si ya existe este ingrediente en el producto
    const existeIngrediente = productoIngredientes.some(
      pi => pi.ingredienteId === ingredienteId
    );

    if (existeIngrediente) {
      // Actualizar la cantidad si ya existe
      return productoIngredientes.map(pi =>
        pi.ingredienteId === ingredienteId
          ? {
              ...pi,
              cantidadRequerida,
              esExtraPermitido,
              precioExtra,
              minimoExtra,
              maximoExtra
            }
          : pi
      );
    } else {
      // Agregar nuevo ingrediente al producto
      return [
        ...productoIngredientes,
        {
          ingredienteId,
          nombre: ingrediente.nombre,
          cantidadRequerida,
          unidadMedida: ingrediente.unidadMedida,
          esExtraPermitido,
          precioExtra,
          minimoExtra,
          maximoExtra,
          icono: ingrediente.icono
        }
      ];
    }
  };

  // Función para eliminar un ingrediente del producto
  const removeIngredienteFromProduct = (
    productoIngredientes: ProductoIngrediente[],
    ingredienteId: string
  ): ProductoIngrediente[] => {
    return productoIngredientes.filter(pi => pi.ingredienteId !== ingredienteId);
  };

  return {
    ingredientes,
    loading,
    error,
    stats,
    user,
    loadIngredientes,
    handleSaveIngrediente,
    handleDeleteIngrediente,
    // Nuevas funciones para manejo de ingredientes en productos
    addIngredienteToProduct,
    removeIngredienteFromProduct
  };
};