/**
 * Product domain models
 * Tipos compartidos para productos en toda la aplicación
 */

export interface ProductoIngrediente {
  id: string;
  productoId: string;
  ingredienteId: string;
  cantidad: number;
  opcional: boolean;
  precioExtra?: number;
  nombre: string;
  unidadMedida: string;
  icono?: string;
  // Campos adicionales para UI
  cantidadRequerida?: number;
  esExtraPermitido?: boolean;
  minimoExtra?: number;
  maximoExtra?: number;
}

export interface ProductCategoria {
  id: string;
  categoria: {
    id: string;
    nombre: string;
    icono?: string;
    orden: number;
    activo: boolean;
  };
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  empresaId: string;
  activo: boolean;
  fotoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductWithExtras extends Producto {
  category?: string;
  tipoStock?: 'individual' | 'compuesto';
  stockIndividual?: number;
  permiteExtras?: boolean;
  ingredientes?: ProductoIngrediente[];
  categorias?: ProductCategoria[];
}

export interface ProductsStats {
  total: number;
  activos: number;
  inactivos: number;
}
