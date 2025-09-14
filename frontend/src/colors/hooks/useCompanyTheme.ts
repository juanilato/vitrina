import { useState, useEffect } from 'react';
import { CompanyTheme } from '../types';
import { getCompanyTheme } from '../themes/companyThemes';

export const useCompanyTheme = (companySlug: string): CompanyTheme => {
  const [theme, setTheme] = useState<CompanyTheme>(getCompanyTheme(companySlug));

  useEffect(() => {
    // Aquí en el futuro podrás hacer una llamada a la API para obtener los colores
    // de la empresa desde la base de datos
    const fetchCompanyTheme = async () => {
      try {
        // TODO: Implementar llamada a API cuando esté disponible
        // const response = await axiosInstance.get(`/companies/${companySlug}/theme`);
        // if (response.data.theme) {
        //   setTheme(response.data.theme);
        // }
        
        // Por ahora, usar el tema local
        setTheme(getCompanyTheme(companySlug));
      } catch (error) {
        console.log('Usando tema por defecto para:', companySlug);
        setTheme(getCompanyTheme('default'));
      }
    };

    fetchCompanyTheme();
  }, [companySlug]);

  return theme;
};
