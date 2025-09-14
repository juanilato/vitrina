// Exportar tipos
export type { CompanyTheme, CompanyThemeConfig } from './types';

// Exportar temas
export { defaultTheme } from './themes/defaultTheme';
export { companyThemes, getCompanyTheme } from './themes/companyThemes';

// Exportar hooks
export { useCompanyTheme } from './hooks/useCompanyTheme';

// Exportar providers
export { ThemeProvider, useTheme } from './providers/ThemeProvider';

// Exportar utilidades
export { applyCompanyTheme, removeCompanyTheme } from './utils/applyTheme';
