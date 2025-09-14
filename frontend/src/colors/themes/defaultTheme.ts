import { CompanyTheme } from '../types';

// Tema por defecto - colores actuales de la aplicación
export const defaultTheme: CompanyTheme = {
  primary: '#007AFF',           // Azul principal (botones activos, precios)
  secondary: '#475569',         // Gris profesional (hover, botones secundarios)
  background: '#f8f9fa',        // Fondo principal claro
  surface: '#ffffff',           // Fondo de tarjetas blanco
  text: '#333333',             // Texto principal oscuro
  textSecondary: '#666666',    // Texto secundario gris
  border: '#e9ecef',           // Bordes grises claros
  success: '#10b981'           // Verde para estados positivos
};
