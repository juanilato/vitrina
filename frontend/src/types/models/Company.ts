/**
 * Company domain models
 * Tipos compartidos para empresas y configuración en toda la aplicación
 */

export type DayKey = 'LUN' | 'MAR' | 'MIE' | 'JUE' | 'VIE' | 'SAB' | 'DOM';

export interface TimeSlot {
  open: string; // "HH:MM"
  close: string; // "HH:MM"
}

export type SocialKey =
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'whatsapp'
  | 'linkedin'
  | 'x'
  | 'youtube'
  | 'website'
  | 'otros';

export interface SocialLink {
  key: SocialKey | string;
  label: string;
  value: string;
}

export interface HorarioAtencionData {
  id: number;
  empresaId: string;
  day: DayKey;
  slotIndex: number;
  abreMin: number;
  cierraMin: number;
  cerrado: boolean;
}

export interface PreferenciasWebData {
  colorBotones: string;
  colorFondo: string;
  envioDomicilio: boolean;
  dashboardFoto: string | null;
  horarios: HorarioAtencionData[];
}

export interface CategoriaData {
  id: string;
  nombre: string;
  icono?: string;
  orden: number;
  activo: boolean;
  subcategorias?: SubcategoriaData[];
}

export interface SubcategoriaData {
  id: string;
  nombre: string;
  categoriaId: string;
  icono?: string;
  orden: number;
  activo: boolean;
}

export interface UbicacionData {
  id: number;
  empresaId?: string;
  direccion?: string;
  lat?: number;
  lng?: number;
  preciosEnvio?: PrecioEnvioData[];
}

export interface PrecioEnvioData {
  id: number;
  empresaId: string;
  ubicacionId: number;
  precio: number;
  distancia: number;
  nombre?: string;
}

export interface EmpresaData {
  id: string;
  email: string;
  name: string;
  logo?: string;
  authMethod?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  ubicaciones: UbicacionData[];
  preferenciasWeb?: PreferenciasWebData | null;
  alias?: string;
  redesSociales?: SocialLink[];
  categoriaId?: string;
  categoria?: CategoriaData;
  subcategorias?: SubcategoriaData[];
}
