// src/features/ingredientes/types/index.ts (Nuevo Archivo)

// Importa el tipo base de tu servicio de backend (debe existir)
import Ingrediente  from '../../../../../services/ingredientesService';

export interface IngredienteWithExtras extends Ingrediente {
  // Campos adicionales para UI
  icono?: string; // Icono de MUI para el frontend
}

export interface IngredienteModalProps {
  ingrediente: IngredienteWithExtras | null;
  user: any; // Usuario autenticado
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

export interface IngredienteStats {
  total: number;
  unidades: number; // Podría ser el total de stock disponible
  tiposUnicos: number; // Podría ser lo mismo que total
}

// --- 1. Tipo Base de la Entidad (Asume que viene de tu ORM/Backend) ---
// Define la estructura mínima de la entidad de Ingrediente que reside en la BD.
// Podría estar importado desde otro lugar (ej: '../../../../../services/ingredientesService'),
// pero lo definimos aquí si no existe en el frontend.
export interface Ingrediente {
  id: string; // ID único del ingrediente
  nombre: string;
  stockDisponible: number;
  unidadMedida: string; // Ej: 'gramos', 'unidades', 'mililitros'
  empresaId: string; // Relación con la empresa
  icono?: string; // Nombre del icono MUI (opcional)
  createdAt: string;
  updatedAt: string;
}

// --- 2. DTO para Creación (CreateIngredienteDto) ---
// Datos requeridos para crear un NUEVO ingrediente.
export interface CreateIngredienteDto {
  nombre: string;
  stockDisponible: number;
  unidadMedida: string;
  empresaId: string; // Necesario para asociarlo a la empresa
  icono?: string; // Opcional al crear
}

// --- 3. DTO para Actualización (UpdateIngredienteDto) ---
// Datos que pueden ser modificados. Todos son opcionales, ya que solo se envía lo que cambia.
export interface UpdateIngredienteDto {
  nombre?: string;
  stockDisponible?: number;
  unidadMedida?: string;
  icono?: string;
}

// --- 4. Tipos de UI (ya definidos previamente) ---

export interface IngredienteWithExtras extends Ingrediente {
  icono?: string; // Asegura el icono si lo usas para la UI
}

export interface IngredienteModalProps {
  // ... (otros campos)
}

export interface IngredienteStats {
  total: number;
  unidades: number; 
  tiposUnicos: number; 
}
// Nota: Puedes reutilizar ImagePreviewModalProps si los ingredientes tienen imagen (aunque no parece el caso)

// --- Mantiene los tipos originales de Producto si aún los necesitas ---
// export interface ProductWithExtras extends Producto { ... }
// export interface ProductModalProps { ... }
// ...