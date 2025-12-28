/**
 * ProductsSection - UI-specific types
 * Usa tipos compartidos de @/types/models
 */

import { ProductWithExtras, ProductoIngrediente } from '../../../../../types/models';

// Props de componentes UI
export interface ProductModalProps {
  product: ProductWithExtras | null;
  user: any;
  onSave: (product: {
    nombre: string;
    descripcion: string;
    precio: number;
    activo: boolean;
    file?: File;
    categoriaIds?: string[];
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

// Re-export modelos compartidos para compatibilidad
export type { ProductWithExtras, ProductoIngrediente, ProductsStats, ProductCategoria } from '../../../../../types/models';
