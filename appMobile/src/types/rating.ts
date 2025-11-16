/**
 * Tipos para el sistema de valoraciones
 */

// Aspectos destacables de empresa
export enum AspectosEmpresa {
  EXCELENTE_CALIDAD = 'EXCELENTE_CALIDAD',
  BUENA_PRESENTACION = 'BUENA_PRESENTACION',
  PORCIONES_GENEROSAS = 'PORCIONES_GENEROSAS',
  RAPIDO = 'RAPIDO',
  BUENA_ATENCION = 'BUENA_ATENCION',
  BUENA_RELACION_PRECIO_CALIDAD = 'BUENA_RELACION_PRECIO_CALIDAD',
  MUY_RICO = 'MUY_RICO',
  FRESCO = 'FRESCO',
  BIEN_EMPAQUETADO = 'BIEN_EMPAQUETADO',
}

// Aspectos destacables de repartidor
export enum AspectosRepartidor {
  PUNTUAL = 'PUNTUAL',
  AMABLE = 'AMABLE',
  CUIDADOSO = 'CUIDADOSO',
  BUENA_COMUNICACION = 'BUENA_COMUNICACION',
  PROFESIONAL = 'PROFESIONAL',
}

// Valoración de un producto individual
export interface ValoracionProducto {
  productoId: string;
  nombreProducto: string;
  calificacion: number; // 1-5
  comentario?: string;
}

// Datos para crear una valoración
export interface CreateValoracionData {
  pedidoId: string;

  // Valoración de la empresa
  calificacionEmpresa: number; // 1-5
  comentarioEmpresa?: string;
  aspectosEmpresa?: AspectosEmpresa[];

  // Valoración de productos
  valoracionProductos?: ValoracionProducto[];

  // Valoración del repartidor (opcional)
  calificacionRepartidor?: number; // 1-5
  comentarioRepartidor?: string;
  aspectosRepartidor?: AspectosRepartidor[];
}

// Valoración completa (respuesta del backend)
export interface Valoracion {
  id: string;
  pedidoId: string;
  clienteId: string;
  empresaId: string;
  repartidorId?: string;

  // Valoración de empresa
  calificacionEmpresa: number;
  comentarioEmpresa?: string;
  aspectosEmpresa: AspectosEmpresa[];

  // Valoración de productos
  valoracionProductos?: ValoracionProducto[];

  // Valoración de repartidor
  calificacionRepartidor?: number;
  comentarioRepartidor?: string;
  aspectosRepartidor: AspectosRepartidor[];

  // Metadata
  createdAt: string;
  updatedAt: string;

  // Relaciones
  cliente?: {
    name: string;
  };
  empresa?: {
    id: string;
    name: string;
    logo?: string;
  };
  repartidor?: {
    id: string;
    name: string;
  };
  pedido?: {
    id: string;
    createdAt: string;
  };
}

// Respuesta de verificación si puede valorar
export interface CanRateResponse {
  canRate: boolean;
  reason?: string;
}

// Promedio de valoraciones
export interface PromedioValoracion {
  promedio: number;
  totalValoraciones: number;
}
