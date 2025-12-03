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

export interface Categoria {
  id: string;
  nombre: string;
  icono?: string;
}

export interface Subcategoria {
  id: string;
  nombre: string;
  icono?: string;
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
  ordersCount?: number; // Added for frontend logic
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
  categoriaId?: string;
  subcategoriaId?: string;
  categoria?: Categoria;
  subcategorias?: Subcategoria[];

  promociones?: Promocion[];
  createdAt: string;
  updatedAt: string;
}

export enum TipoPromocion {
  CANTIDAD = 'CANTIDAD',
  DIA = 'DIA',
  BXPY = 'BXPY',
}

export enum AlcancePromocion {
  TODOS = 'TODOS',
  SELECCIONADOS = 'SELECCIONADOS',
}

export interface Promocion {
  id: string;
  empresaId: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoPromocion;
  configuracion: any;
  alcance: AlcancePromocion;
  activo: boolean;
  productos?: { productoId: string }[];
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

export interface Ingrediente {
  id: string;
  nombre: string;
  empresaId: string;
  stockDisponible: number;
  unidadMedida: string;
  icono?: string;
}

export interface ProductoIngrediente {
  id: number;
  productoId: string;
  ingredienteId: string;
  ingrediente: Ingrediente;
  cantidadRequerida: number;
  esExtraPermitido: boolean;
  precioExtra?: number | string;
  minimoExtra?: number;
  maximoExtra?: number;
}

export interface CategoriaProducto {
  id: string;
  nombre: string;
  empresaId: string;
  icono?: string;
  orden: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    productos: number;
  };
}

export interface ProductoCategoria {
  id: number;
  productoId: string;
  categoriaId: string;
  categoria: CategoriaProducto;
  createdAt: string;
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
  ingredientes?: ProductoIngrediente[];
  categorias?: ProductoCategoria[];
  permiteExtras?: boolean;
  createdAt: string;
  updatedAt: string;
}
