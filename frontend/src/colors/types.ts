export interface CompanyTheme {
  primary: string;        // Color principal (botones activos, precios)
  secondary: string;      // Color secundario (hover, acentos)
  background: string;     // Fondo principal
  surface: string;        // Fondo de tarjetas
  text: string;          // Texto principal
  textSecondary: string; // Texto secundario
  border: string;        // Bordes
  success: string;       // Estados positivos (abierto, etc.)
}

export interface CompanyThemeConfig {
  companySlug: string;
  theme: CompanyTheme;
}
