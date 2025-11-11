import { EmpresaData } from '../components/dashboard/sections/AccountConfigSection/types';

/**
 * Calcula si el perfil de la empresa está completo
 * Un perfil se considera completo cuando tiene todos los campos básicos configurados
 */
export const isProfileComplete = (empresaData: EmpresaData | null): boolean => {
  if (!empresaData) return false;

  // Datos esenciales de empresa
  const hasName = !!empresaData.name;
  const hasEmail = !!empresaData.email;
  const hasLogo = !!empresaData.logo;
  const hasLocation = !!empresaData.ubicaciones?.[0]?.direccion;
  const hasCategoria = !!empresaData.categoriaId;
  const hasSubcategorias = (empresaData.subcategorias?.length || 0) > 0;

  // Datos de preferencias
  const hasColors = !!(empresaData.preferenciasWeb?.colorBotones || empresaData.preferenciasWeb?.colorFondo);
  const hasSchedule = (empresaData.preferenciasWeb?.horarios?.length || 0) > 0;
  const hasSocialLinks = Array.isArray(empresaData.redesSociales) && empresaData.redesSociales.length > 0;
  const hasAlias = !!empresaData.alias;

  // El perfil está completo si tiene todos los datos esenciales
  return hasName && hasEmail && hasLogo && hasLocation && hasCategoria && hasSubcategorias &&
         hasColors && hasSchedule && hasSocialLinks && hasAlias;
};

/**
 * Calcula el porcentaje de completación del perfil
 */
export const getProfileCompletionPercentage = (empresaData: EmpresaData | null): number => {
  if (!empresaData) return 0;

  const hasName = !!empresaData.name;
  const hasEmail = !!empresaData.email;
  const hasLogo = !!empresaData.logo;
  const hasLocation = !!empresaData.ubicaciones?.[0]?.direccion;
  const hasCategoria = !!empresaData.categoriaId;
  const hasSubcategorias = (empresaData.subcategorias?.length || 0) > 0;
  const hasColors = !!(empresaData.preferenciasWeb?.colorBotones || empresaData.preferenciasWeb?.colorFondo);
  const hasSchedule = (empresaData.preferenciasWeb?.horarios?.length || 0) > 0;
  const hasSocialLinks = Array.isArray(empresaData.redesSociales) && empresaData.redesSociales.length > 0;
  const hasAlias = !!empresaData.alias;

  const fields = [hasName, hasEmail, hasLogo, hasLocation, hasCategoria, hasSubcategorias, hasColors, hasSchedule, hasSocialLinks, hasAlias];
  const completed = fields.filter(Boolean).length;

  return Math.round((completed / fields.length) * 100);
};
