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

export interface Preferencias {
  id: string;
  colorPrimario?: string;
  colorSecundario?: string;
  logo?: string;
  bannerImagen?: string;
  descripcionCorta?: string;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
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
  ubicaciones?: Ubicacion[];
  preferenciasWeb?: Preferencias;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyWithProducts extends Company {
  products?: Product[];
}

export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
  fotoUrl?: string;
  empresaId: string;
  empresa?: Company;
  createdAt: string;
  updatedAt: string;
}
