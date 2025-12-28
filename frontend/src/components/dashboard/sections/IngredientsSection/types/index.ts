/**
 * IngredientsSection - UI-specific types
 * Usa tipos compartidos de @/types/models
 */

import { Ingrediente, IngredienteWithExtras } from '../../../../../types/models';

// DTOs para API
export interface CreateIngredienteDto {
  nombre: string;
  stockDisponible: number;
  unidadMedida: string;
  empresaId: string;
  icono?: string;
}

export interface UpdateIngredienteDto {
  nombre?: string;
  stockDisponible?: number;
  unidadMedida?: string;
  icono?: string;
}

// Props de componentes UI
export interface IngredienteModalProps {
  ingrediente: IngredienteWithExtras | null;
  user: any;
  onSave: (ingrediente: {
    nombre: string;
    stockDisponible: number;
    unidadMedida: string;
    icono?: string;
  }) => void;
  onClose: () => void;
}

export interface IngredienteRowProps {
  ingrediente: IngredienteWithExtras;
  onEdit: (ingrediente: IngredienteWithExtras) => void;
  onDelete: (ingredienteId: string) => void;
}

// Re-export modelos compartidos para compatibilidad
export type {
  Ingrediente,
  IngredienteWithExtras,
  IngredienteStats
} from '../../../../../types/models';
