import { CompanyTheme } from '../types';

// Función para aplicar un tema a las variables CSS del documento
export const applyCompanyTheme = (theme: CompanyTheme): void => {
  const root = document.documentElement;
  
  root.style.setProperty('--company-primary', theme.primary);
  root.style.setProperty('--company-secondary', theme.secondary);
  root.style.setProperty('--company-background', theme.background);
  root.style.setProperty('--company-surface', theme.surface);
  root.style.setProperty('--company-text', theme.text);
  root.style.setProperty('--company-text-secondary', theme.textSecondary);
  root.style.setProperty('--company-border', theme.border);
  root.style.setProperty('--company-success', theme.success);
};

// Función para remover el tema (volver al default)
export const removeCompanyTheme = (): void => {
  const root = document.documentElement;
  
  root.style.removeProperty('--company-primary');
  root.style.removeProperty('--company-secondary');
  root.style.removeProperty('--company-background');
  root.style.removeProperty('--company-surface');
  root.style.removeProperty('--company-text');
  root.style.removeProperty('--company-text-secondary');
  root.style.removeProperty('--company-border');
  root.style.removeProperty('--company-success');
};
