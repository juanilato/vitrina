import React, { createContext, useContext, useEffect } from 'react';
import { CompanyTheme } from '../types';
import { useCompanyTheme } from '../hooks/useCompanyTheme';
import { applyCompanyTheme, removeCompanyTheme } from '../utils/applyTheme';

interface ThemeContextType {
  theme: CompanyTheme;
  applyTheme: () => void;
  removeTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  companySlug: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  companySlug 
}) => {
  const theme = useCompanyTheme(companySlug);

  const applyTheme = () => {
    applyCompanyTheme(theme);
  };

  const removeTheme = () => {
    removeCompanyTheme();
  };

  // Aplicar el tema automáticamente cuando cambie
  useEffect(() => {
    applyTheme();
    
    // Cleanup: remover el tema cuando el componente se desmonte
    return () => {
      removeTheme();
    };
  }, [theme, companySlug]);

  const value: ThemeContextType = {
    theme,
    applyTheme,
    removeTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para usar el contexto del tema
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
