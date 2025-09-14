# 🎨 Sistema de Colores Centralizado - Vitrina

## 📋 Descripción

Sistema de colores dinámico que permite a las empresas personalizar los colores de sus tiendas en la ruta `/tienda/[empresa]`.

## 🏗️ Arquitectura

```
📁 colors/
  ├── types.ts              # Tipos TypeScript
  ├── themes/
  │   ├── defaultTheme.ts   # Tema por defecto
  │   └── companyThemes.ts  # Temas de empresas
  ├── hooks/
  │   └── useCompanyTheme.ts # Hook para obtener colores
  ├── providers/
  │   └── ThemeProvider.tsx # Context provider
  ├── utils/
  │   └── applyTheme.ts     # Utilidades para aplicar temas
  └── index.ts             # Exportaciones principales
```

## 🎨 Variables CSS

El sistema utiliza 8 variables CSS principales:

```css
:root {
  --company-primary: #007AFF;        /* Color principal */
  --company-secondary: #475569;     /* Color secundario */
  --company-background: #f8f9fa;    /* Fondo principal */
  --company-surface: #ffffff;       /* Fondo de tarjetas */
  --company-text: #333333;          /* Texto principal */
  --company-text-secondary: #666666; /* Texto secundario */
  --company-border: #e9ecef;        /* Bordes */
  --company-success: #10b981;       /* Estados positivos */
}
```

## 🚀 Uso

### 1. Envolver el componente con ThemeProvider

```tsx
import { ThemeProvider } from '../../../colors';

return (
  <ThemeProvider companySlug={companyName || 'default'}>
    <div className="company-store-page-clean">
      {/* Tu contenido aquí */}
    </div>
  </ThemeProvider>
);
```

### 2. Los colores se aplican automáticamente

El `ThemeProvider` aplica automáticamente los colores según el `companySlug`:

- Si existe un tema personalizado para la empresa → usa esos colores
- Si no existe → usa el tema por defecto

### 3. Agregar nuevos temas de empresas

Edita `companyThemes.ts`:

```typescript
export const companyThemes: Record<string, CompanyTheme> = {
  'mi-empresa': {
    primary: '#ff6b35',         // Naranja
    secondary: '#e55a2b',       // Naranja oscuro
    background: '#fff5f2',      // Fondo naranja claro
    surface: '#ffffff',         // Tarjetas blancas
    text: '#333333',           // Texto principal
    textSecondary: '#666666',  // Texto secundario
    border: '#ffe4d6',         // Bordes naranjas
    success: '#10b981'         // Verde para estados positivos
  }
};
```

## 📱 Componentes Afectados

Los siguientes componentes ahora usan las variables CSS:

- ✅ `CompanyStorePage` - Página principal de la tienda
- ✅ `CompanyStoreProductCard` - Tarjetas de productos
- ✅ `CartSummary` - Resumen del carrito
- ✅ Botones de delivery/retirar
- ✅ Modal del carrito
- ✅ Modal de detalles del producto
- ✅ Botón flotante del carrito

## 🔄 Flujo de Aplicación

1. **Usuario visita** `/tienda/mi-empresa`
2. **ThemeProvider** recibe `companySlug = 'mi-empresa'`
3. **useCompanyTheme** busca el tema en `companyThemes`
4. **applyCompanyTheme** aplica las variables CSS al documento
5. **Todos los componentes** usan automáticamente los nuevos colores

## 🎯 Beneficios

- ✅ **Centralizado**: Un solo lugar para gestionar colores
- ✅ **Escalable**: Fácil agregar nuevas empresas
- ✅ **Consistente**: Mismo sistema para toda la aplicación
- ✅ **Automático**: No requiere cambios en componentes existentes
- ✅ **Fallback**: Siempre hay un tema por defecto
- ✅ **TypeScript**: Tipado fuerte para prevenir errores

## 🔮 Futuro

El sistema está preparado para:

- Conectar con API de base de datos
- Panel de administración para empresas
- Temas más complejos (gradientes, patrones)
- Modo oscuro/claro automático
