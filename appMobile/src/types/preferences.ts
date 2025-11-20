export interface UserPreferences {
  clienteId: string;
  temaOscuro: boolean;
  notificacionesPush: boolean;
  notificacionesEmail: boolean;
  notificarEstadoPedidos: boolean;
  notificarPromociones: boolean;
  compartirUbicacion: boolean;
  historialComprasVisible: boolean;
  idioma: string;
  moneda: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencesDto {
  temaOscuro?: boolean;
  notificacionesPush?: boolean;
  notificacionesEmail?: boolean;
  notificarEstadoPedidos?: boolean;
  notificarPromociones?: boolean;
  compartirUbicacion?: boolean;
  historialComprasVisible?: boolean;
  idioma?: string;
  moneda?: string;
}

export interface NotificationPreferences {
  notificacionesPush?: boolean;
  notificacionesEmail?: boolean;
  notificarEstadoPedidos?: boolean;
  notificarPromociones?: boolean;
}

export interface PrivacyPreferences {
  compartirUbicacion?: boolean;
  historialComprasVisible?: boolean;
}
