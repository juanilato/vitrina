/**
 * Ingredient domain models
 * Tipos compartidos para ingredientes en toda la aplicación
 */

export interface Ingrediente {
  id: string;
  nombre: string;
  stockDisponible: number;
  unidadMedida: string;
  empresaId: string;
  icono?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IngredienteWithExtras extends Ingrediente {
  // Campos adicionales para UI si se necesitan en el futuro
}

export interface IngredienteStats {
  total: number;
  unidades: number;
  tiposUnicos: number;
}
