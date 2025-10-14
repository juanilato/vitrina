// src/features/ingredientes/components/index.ts (Nuevo archivo)

// 1. Modal para Ingrediente (Adaptación de ProductModal)
export { default as IngredienteModal } from './IngredienteModal';

// 2. Fila/Tarjeta para Ingrediente (Adaptación de ProductCard/ProductRow)
export { default as IngredienteRow } from './IngredienteRow'; 


// 4. Reutilización del Skeleton Loader de Productos
// (Se usa en IngredientesSection para mostrar el estado de carga)
export { default as ProductsSkeletonLoader } from './SkeletonLoader';