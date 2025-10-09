// utils/theme.ts
const clamp = (n: number, min=0, max=255) => Math.min(max, Math.max(min, n));

const hexToRgb = (hex: string) => {
  const m = hex?.replace('#','').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) };
};

const rgbToHex = (r: number, g: number, b: number) =>
  '#' + [r,g,b].map(v => clamp(v).toString(16).padStart(2,'0')).join('');

const lighten = (hex: string, amt=20) => {
  const rgb = hexToRgb(hex); if (!rgb) return hex;
  return rgbToHex(rgb.r+amt, rgb.g+amt, rgb.b+amt);
};

const darken = (hex: string, amt=20) => {
  const rgb = hexToRgb(hex); if (!rgb) return hex;
  return rgbToHex(rgb.r-amt, rgb.g-amt, rgb.b-amt);
};

const idealText = (hex: string) => {
  const rgb = hexToRgb(hex); if (!rgb) return '#0f172a';
  // luminancia relativa simple
  const L = (0.2126*rgb.r + 0.7152*rgb.g + 0.0722*rgb.b) / 255;
  return L > 0.6 ? '#0f172a' : '#ffffff'; // claro → texto oscuro, oscuro → texto blanco
};

export function applyCompanyTheme(colorBotones?: string, colorFondo?: string) {
  const root = document.documentElement;
  const primary = colorBotones || getComputedStyle(root).getPropertyValue('--vitrina-primary').trim() || '#0f172a';
  const secondary = darken(primary, 25);   // para gradientes
  const accent = lighten(primary, 20);     // acentos
  const bg = colorFondo || getComputedStyle(root).getPropertyValue('--vitrina-light').trim() || '#f8fafc';
  const textOnPrimary = idealText(primary);

  // Core brand
  root.style.setProperty('--vitrina-primary', primary);
  root.style.setProperty('--vitrina-secondary', secondary);
  root.style.setProperty('--vitrina-accent', accent);

  // Fondo global donde usás var(--vitrina-light)
  root.style.setProperty('--vitrina-light', bg);

  // Ajustes de contraste básicos
  root.style.setProperty('--vitrina-white', '#ffffff');
  root.style.setProperty('--vitrina-text', '#0f172a');
  root.style.setProperty('--vitrina-text-secondary', '#475569');

  // Opcional: botones con texto legible sobre primary
  root.style.setProperty('--vitrina-btn-text-on-primary', textOnPrimary);
}
    