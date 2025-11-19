import { Producto, ProductoIngrediente as ProductoIngredienteBase } from '../../../../../services/productosService';

// Interfaz extendida para ingredientes en productos con información adicional para UI
export interface ProductoIngrediente extends ProductoIngredienteBase {
  nombre: string;
  unidadMedida: string;
  icono?: string;
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

export interface ProductWithExtras extends Producto {
  // Solo campos que existen en el backend: nombre, descripcion, precio, empresaId, activo
  // Campos adicionales para UI (opcionales)
  category?: string; // Para mostrar en UI (simulado)
  fotoUrl?: string; // Para mostrar en UI (simulado)
  tipoStock?: string; // "individual" o "compuesto"
  stockIndividual?: number;
  permiteExtras?: boolean;
  ingredientes?: ProductoIngrediente[];
  categorias?: ProductCategoria[]; // Categorías asignadas al producto
}

export interface ProductModalProps {
  product: ProductWithExtras | null;
  user: any; // Usuario autenticado
  onSave: (product: {
    nombre: string;
    descripcion: string;
    precio: number;
    activo: boolean;
    file?: File;
    categoriaIds?: string[]; // IDs de categorías seleccionadas
  }) => void;
  onClose: () => void;
}

export interface StockManagementModalProps {
  product: ProductWithExtras;
  onSave: (data: {
    tipoStock: string;
    stockIndividual?: number;
    permiteExtras: boolean;
    ingredientes?: ProductoIngrediente[];
  }) => void;
  onClose: () => void;
}

export interface ImagePreviewModalProps {
  show: boolean;
  imageUrl: string | null;
  fileName?: string;
  isNewImage?: boolean;
  onClose: () => void;
}

export interface ProductCardProps {
  product: ProductWithExtras;
  onEdit: (product: ProductWithExtras) => void;
  onDelete: (productId: string) => void;
  onManageStock?: (product: ProductWithExtras) => void;
}

export interface ProductsStats {
  total: number;
  activos: number;
  inactivos: number;
}
