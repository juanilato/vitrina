export interface EmpresaData {
  id: string;
  email: string;
  name: string;
  logo?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  ubicaciones: UbicacionData[];
}

export interface UbicacionData {
  id: number;
  empresaId?: string; // Hacer opcional ya que se obtiene del contexto
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
  empresaId?: string; // Hacer opcional ya que se obtiene del contexto
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

export interface AccountConfigFormData {
  // Información básica
  name: string;
  email: string;
  logo?: string;
  
  // Ubicaciones
  ubicaciones: UbicacionData[];
  
  // Cambio de contraseña
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
  activeTab: 'profile' | 'locations' | 'security' | 'preferences';
}

export interface AccountConfigActions {
  loadEmpresaData: () => Promise<void>;
  updateProfile: (data: UpdateEmpresaData) => Promise<void>;
  updateLocation: (locationId: number, data: UpdateUbicacionData) => Promise<void>;
  addLocation: (data: Omit<UbicacionData, 'id'>) => Promise<void>;
  removeLocation: (locationId: number) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  uploadLogo: (file: File) => Promise<string>;
  resetForm: () => void;
  setActiveTab: (tab: AccountConfigState['activeTab']) => void;
  // Precios de envío
  getPreciosEnvio: (ubicacionId: number) => Promise<PrecioEnvioData[]>;
  createPrecioEnvio: (ubicacionId: number, data: CreatePrecioEnvioData) => Promise<void>;
  updatePrecioEnvio: (ubicacionId: number, precioId: number, data: UpdatePrecioEnvioData) => Promise<void>;
  removePrecioEnvio: (ubicacionId: number, precioId: number) => Promise<void>;
}
