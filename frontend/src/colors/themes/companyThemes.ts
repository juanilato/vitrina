import { CompanyTheme, CompanyThemeConfig } from '../types';
import { defaultTheme } from './defaultTheme';

// Ejemplos de temas personalizados para empresas
export const companyThemes: Record<string, CompanyTheme> = {
  // Ejemplo: Burger King (colores naranjas)
  'burger-king': {
    primary: '#ff6b35',         // Naranja principal
    secondary: '#e55a2b',       // Naranja más oscuro
    background: '#fff5f2',      // Fondo naranja muy claro
    surface: '#ffffff',         // Tarjetas blancas
    text: '#333333',           // Texto principal
    textSecondary: '#666666',  // Texto secundario
    border: '#ffe4d6',         // Bordes naranjas claros
    success: '#10b981'         // Verde para estados positivos
  },
  
  // Ejemplo: Starbucks (colores verdes)
  'starbucks': {
    primary: '#00704a',         // Verde Starbucks
    secondary: '#004d33',       // Verde más oscuro
    background: '#f0f8f4',      // Fondo verde muy claro
    surface: '#ffffff',         // Tarjetas blancas
    text: '#333333',           // Texto principal
    textSecondary: '#666666',  // Texto secundario
    border: '#d4e8dc',         // Bordes verdes claros
    success: '#10b981'         // Verde para estados positivos
  }
};

// Función para obtener el tema de una empresa
export const getCompanyTheme = (companySlug: string): CompanyTheme => {
  return companyThemes[companySlug] || defaultTheme;
};
