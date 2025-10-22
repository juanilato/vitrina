/**
 * Company Types
 */

export interface Ubicacion {
  id: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal?: string;
  lat: number;
  lng: number;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
}

export enum DayOfWeek {
  LUN = 'LUN',
  MAR = 'MAR',
  MIE = 'MIE',
  JUE = 'JUE',
  VIE = 'VIE',
  SAB = 'SAB',
  DOM = 'DOM',
}

export interface HorarioAtencion {
  id: number;
  empresaId: string;
  day: DayOfWeek;
  slotIndex: number;
  abreMin: number;
  cierraMin: number;
  cerrado: boolean;
}

export interface Preferencias {
  empresaId: string;
  colorBotones?: string;
  colorFondo?: string;
  envioDomicilio: boolean;
  dashboardFoto?: string;
  horarios?: HorarioAtencion[];
}

export interface Company {
  id: string;
  name: string;
  email: string;
  description?: string;
  logo?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  alias?: string;
  redesSociales?: {
    key: string;
    label: string;
    value: string;
  }[];
  ubicacion?: Ubicacion;
  ubicaciones?: Ubicacion[];
  preferenciasWeb?: Preferencias;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyWithProducts extends Company {
  products?: Product[];
}

export interface Agregado {
  id: string;
  nombre: string;
  precio: number;
  activo: boolean;
  productoId: string;
}

export interface Product {
  id: string;
  nombre: string;
  name?: string; // Alias for nombre
  descripcion: string;
  description?: string; // Alias for descripcion
  precio: number;
  price?: number; // Alias for precio
  activo: boolean;
  active?: boolean; // Alias for activo
  fotoUrl?: string;
  images?: string[]; // Alternative format
  empresaId: string;
  empresa?: Company;
  agregados?: Agregado[];
  createdAt: string;
  updatedAt: string;
}
