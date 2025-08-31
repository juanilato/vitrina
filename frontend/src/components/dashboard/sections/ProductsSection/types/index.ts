import { Producto } from '../../../../../services/productosService';

export interface ProductWithExtras extends Producto {
  // Solo campos que existen en el backend: nombre, descripcion, precio, empresaId, activo
  // Campos adicionales para UI (opcionales)
  category?: string; // Para mostrar en UI (simulado)
  fotoUrl?: string; // Para mostrar en UI (simulado)
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
}

export interface ProductsStats {
  total: number;
  activos: number;
  inactivos: number;
}
