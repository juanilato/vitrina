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
  empresaId: string;
  direccion?: string;
  lat?: number;
  lng?: number;
}

export interface UpdateEmpresaData {
  name?: string;
  email?: string;
  logo?: string;
}

export interface UpdateUbicacionData {
  id?: number;
  direccion?: string;
  lat?: number;
  lng?: number;
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
}
