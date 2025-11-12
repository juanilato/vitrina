// --- Tipos para las preferencias ---
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
  key: SocialKey | string; // permití custom keys
  label: string;           // cómo lo mostrás (ej: "Instagram Tienda")
  value: string;           // URL o @handle
}

export interface PreferencesState {
  dashboardFotoUrl: string;
  envioDomicilio: boolean;
  colorBotones: string;
  colorFondo: string;
  schedule: Record<DayKey, TimeSlot[]>;
}
export interface PreferenciasWebData {
  colorBotones: string;
  colorFondo: string;
  envioDomicilio: boolean;
  dashboardFoto: string | null;
  horarios: HorarioAtencionData[];
}
// --- Categorías y Subcategorías ---
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

export interface UpdateCategoriasPayload {
  categoriaId?: string;
  subcategoriaIds?: string[];
}

// --- Datos de la empresa ---
export interface EmpresaData {
  id: string;
  email: string;
  name: string;
  logo?: string;
  authMethod?: string; // "normal" o "google"
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
export interface HorarioAtencionData {
  id: number;
  empresaId: string;
  day: DayKey;
  slotIndex: number;
  abreMin: number;
  cierraMin: number;
  cerrado: boolean;
}

export interface UpdatePreferenciasPayload {
  empresaId?: string;
  colorBotones: string | null;
  colorFondo: string | null;
  envioDomicilio: boolean;
  dashboardFoto: string | null;
  horarios: {
    day: DayKey;
    slotIndex: number;
    abreMin: number;
    cierraMin: number;
    cerrado: boolean;
  }[];
}

// --- Ubicaciones ---
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

export interface UpdateEmpresaData {
  name?: string;
  email?: string;
  logo?: string;
}

export interface UpdateUbicacionData {
  id?: number;
  empresaId?: string;
  direccion?: string;
  lat?: number;
  lng?: number;
}

export interface CreatePrecioEnvioData {
  ubicacionId: number;
  precio: number;
  distancia: number;
  nombre?: string;
}

export interface UpdatePrecioEnvioData {
  precio?: number;
  distancia?: number;
  nombre?: string;
}

// --- Account Config ---
export interface AccountConfigFormData {
  name: string;
  email: string;
  logo?: string;
  ubicaciones: UbicacionData[];
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface AccountConfigState {
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  empresaData: EmpresaData | null;
  formData: AccountConfigFormData;
  hasChanges: boolean;
  activeTab: 'profile' | 'categories' | 'locations' | 'delivery' | 'preferences' | 'subscription';
}

export interface UpdateEmpresaExtrasPayload {
  empresaId: string;
  alias: string;
  redesSociales: SocialLink[];
}

export type Ubicacion = {
  direccion: string;
  lat: number;
  lng: number;
};

export interface AccountConfigActions {
  loadEmpresaData: () => Promise<void>;
  updateProfile: (data: UpdateEmpresaData) => Promise<void>;
  updateLocation: (locationId: number, data: UpdateUbicacionData) => Promise<void>;
  addLocation: (data: Omit<UbicacionData, 'id'>) => Promise<void>;
  removeLocation: (locationId: number) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  uploadFoto: (file: File, dashboard: boolean) => Promise<string>;
  resetForm: () => void;
  setActiveTab: (tab: AccountConfigState['activeTab']) => void;
  getPreciosEnvio: (ubicacionId: number) => Promise<PrecioEnvioData[]>;
  createPrecioEnvio: (ubicacionId: number, data: CreatePrecioEnvioData) => Promise<void>;
  updatePrecioEnvio: (ubicacionId: number, precioId: number, data: UpdatePrecioEnvioData) => Promise<void>;
  removePrecioEnvio: (ubicacionId: number, precioId: number) => Promise<void>;
  updatePreferences: (payload: UpdatePreferenciasPayload) => Promise<void>;
  updateApariencia: (colorBotones: string, colorFondo: string, envioDomicilio: boolean) => Promise<void>;
  updateHorarios: (schedule: Record<DayKey, TimeSlot[]>) => Promise<void>;
  updateEmpresaExtras: (payload: UpdateEmpresaExtrasPayload) => Promise<void>;
  cargaUbicacionInicial: (empresaId: string, ubicacion: Ubicacion) => void;
  getCategorias: () => Promise<CategoriaData[]>;
  updateCategorias: (payload: UpdateCategoriasPayload) => Promise<void>;
}
