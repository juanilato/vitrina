# Gu\u00eda de Estilos Vitrina - Sistema de Diseño Modernizado

## 📋 Resumen de Actualizaciones

Este documento describe el nuevo sistema de diseño modernizado aplicado al proyecto Vitrina, basado en el estilo de la landing page empresarial.

---

## 🎨 Sistema de Colores

### Colores Principales
```css
--vitrina-primary: #0A2A43        /* Azul oscuro corporativo */
--vitrina-secondary: #2E9D66      /* Verde - acciones secundarias */
--vitrina-accent: #007ACC          /* Azul brillante - interactivo */
--vitrina-orange: #F26B1D          /* Naranja - CTAs */
```

### Colores de Estado
```css
--vitrina-success: #2E9D66
--vitrina-warning: #F26B1D
--vitrina-danger: #DC2626
--vitrina-info: #007ACC
```

---

## 🔲 Border Radius (Actualizado)

### Sistema Completo
```css
--vitrina-radius-xs: 4px          /* Elementos muy pequeños */
--vitrina-radius-sm: 6px          /* Inputs, badges pequeños */
--vitrina-radius: 8px             /* Default estándar */
--vitrina-radius-md: 12px         /* Tarjetas pequeñas, botones */
--vitrina-radius-lg: 16px         /* Tarjetas grandes */
--vitrina-radius-xl: 20px         /* Modales, containers */
--vitrina-radius-2xl: 24px        /* Hero sections */
--vitrina-radius-3xl: 32px        /* Elementos especiales */
--vitrina-radius-full: 9999px     /* Botones pill, badges */
--vitrina-radius-circle: 50%      /* Avatares, iconos */
```

### Aplicación Recomendada
- **Botones pequeños**: `var(--vitrina-radius)` (8px)
- **Botones normales**: `var(--vitrina-radius-md)` (12px)
- **Botones grandes**: `var(--vitrina-radius-lg)` (16px)
- **Cards**: `var(--vitrina-radius-lg)` (16px)
- **Modales**: `var(--vitrina-radius-xl)` (20px)
- **Badges/Pills**: `var(--vitrina-radius-full)` (9999px)

---

## 🌫️ Sombras (Sistema Mejorado)

### Sombras Neutras
```css
--vitrina-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05)
--vitrina-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06)
--vitrina-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)
--vitrina-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)
--vitrina-shadow-lg: 0 8px 20px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)
--vitrina-shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)
--vitrina-shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.18), 0 10px 20px rgba(0, 0, 0, 0.12)
```

### Sombras de Color (Hover/Focus)
```css
--vitrina-shadow-primary: 0 4px 14px rgba(10, 42, 67, 0.25)
--vitrina-shadow-secondary: 0 4px 14px rgba(46, 157, 102, 0.35)
--vitrina-shadow-accent: 0 4px 14px rgba(0, 122, 204, 0.3)
--vitrina-shadow-success: 0 4px 12px rgba(46, 157, 102, 0.3)
--vitrina-shadow-danger: 0 4px 12px rgba(220, 38, 38, 0.3)
```

### Cuándo Usar
- **xs/sm**: Elementos sutiles, hover states leves
- **default**: Cards normales, dropdowns
- **md**: Cards interactivas, tooltips
- **lg**: Modales, popups
- **xl/2xl**: Hero sections, elementos destacados

---

## ⏱️ Transiciones y Animaciones

### Duraciones
```css
--vitrina-transition-fast: 150ms ease
--vitrina-transition: 200ms ease
--vitrina-transition-base: 250ms ease
--vitrina-transition-slow: 300ms ease
--vitrina-transition-slower: 400ms ease
```

### Timing Functions (Curvas de Bezier)
```css
--vitrina-ease-in: cubic-bezier(0.4, 0, 1, 1)
--vitrina-ease-out: cubic-bezier(0, 0, 0.2, 1)
--vitrina-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
--vitrina-ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1)
--vitrina-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)  /* Efecto rebote */
```

### Duraciones Específicas
```css
--vitrina-duration-instant: 100ms
--vitrina-duration-fast: 200ms
--vitrina-duration-normal: 300ms
--vitrina-duration-slow: 500ms
```

---

## 🎨 Gradientes Predefinidos

```css
--vitrina-gradient-primary: linear-gradient(135deg, #0A2A43 0%, #051627 100%)
--vitrina-gradient-secondary: linear-gradient(135deg, #2E9D66 0%, #26824f 100%)
--vitrina-gradient-accent: linear-gradient(135deg, #007ACC 0%, #005a9e 100%)
--vitrina-gradient-warm: linear-gradient(135deg, #F26B1D 0%, #d4590f 100%)
--vitrina-gradient-hero: linear-gradient(135deg, #0A2A43 0%, #007ACC 100%)
--vitrina-gradient-success: linear-gradient(135deg, #2E9D66 0%, #26824f 100%)
--vitrina-gradient-light: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)
```

### Overlays
```css
--vitrina-overlay-dark: linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 100%)
--vitrina-overlay-light: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)
```

---

## 🔘 Botones Modernizados

### Clases Disponibles

#### `.btn` - Base
```css
padding: 0.875rem 1.75rem
border-radius: var(--vitrina-radius-md)  /* 12px */
font-weight: 600
min-height: 44px
transition: all 200ms ease-out
```

#### `.btn-primary`
- Fondo: Gradiente azul oscuro
- Sombra: Color primario
- Hover: Lift effect + sombra aumentada

#### `.btn-secondary`
- Fondo: Gradiente verde
- Sombra: Color secundario
- Hover: Lift effect

#### `.btn-outline`
- Fondo: Blanco
- Border: 2px gris
- Hover: Fondo gris claro, border primario

#### `.btn-danger`
- Fondo: Rojo sólido
- Hover: Rojo más oscuro + lift

#### `.btn-success`
- Fondo: Gradiente verde
- Hover: Lift effect

### Tamaños
```css
.btn-sm   /* Pequeño: 36px altura */
.btn      /* Normal: 44px altura */
.btn-lg   /* Grande: 52px altura */
```

### Estados
```css
.btn:hover        /* translateY(-2px) + sombra */
.btn:active       /* translateY(0) */
.btn:disabled     /* opacity: 0.5, no interacción */
.btn.loading      /* opacity: 0.6, spinner visible */
```

---

## 🗂️ Cards Modernizadas

### Clases Disponibles

#### `.card` - Base
```css
border-radius: var(--vitrina-radius-lg)  /* 16px */
box-shadow: var(--vitrina-shadow)
border: 1px solid var(--vitrina-border)
transition: all 200ms ease-out
```

#### Hover Effect
```css
transform: translateY(-4px)
box-shadow: var(--vitrina-shadow-lg)
border-color: var(--vitrina-border-dark)
```

### Estructura
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Título</h3>
  </div>
  <div class="card-content">
    <!-- Contenido -->
  </div>
  <div class="card-footer">
    <!-- Footer opcional -->
  </div>
</div>
```

### Variantes
```css
.card.card-flat       /* Sin sombra */
.card.card-elevated   /* Sombra grande, hover más pronunciado */
```

---

## 🏷️ Badges Modernizados

### Estilo Base
```css
padding: 0.375rem 0.875rem
border-radius: var(--vitrina-radius-full)  /* 9999px - pill shape */
font-size: 0.75rem (12px)
font-weight: 700
text-transform: uppercase
letter-spacing: 0.5px
border: 1px solid (color-specific)
```

### Variantes
```css
.badge-primary
.badge-secondary
.badge-success
.badge-warning
.badge-danger
.badge-info
```

### Sólidas
```css
.badge-solid.badge-primary   /* Fondo sólido en vez de translúcido */
.badge-solid.badge-success
/* etc... */
```

---

## 📐 Espaciado

```css
--vitrina-space-xs: 0.25rem    /* 4px */
--vitrina-space-sm: 0.5rem     /* 8px */
--vitrina-space: 1rem          /* 16px */
--vitrina-space-md: 1.5rem     /* 24px */
--vitrina-space-lg: 2rem       /* 32px */
--vitrina-space-xl: 3rem       /* 48px */
```

---

## 🔤 Tipografía

### Tamaños
```css
--vitrina-text-xs: 0.75rem     /* 12px */
--vitrina-text-sm: 0.875rem    /* 14px */
--vitrina-text-base: 1rem      /* 16px */
--vitrina-text-lg: 1.125rem    /* 18px */
--vitrina-text-xl: 1.25rem     /* 20px */
--vitrina-text-2xl: 1.5rem     /* 24px */
--vitrina-text-3xl: 1.875rem   /* 30px */
--vitrina-text-4xl: 2.25rem    /* 36px */
```

### Pesos
```css
--vitrina-font-normal: 400
--vitrina-font-medium: 500
--vitrina-font-semibold: 600
--vitrina-font-bold: 700
--vitrina-font-extrabold: 800
```

### Line Heights
```css
--vitrina-leading-tight: 1.25
--vitrina-leading-normal: 1.5
--vitrina-leading-relaxed: 1.75
```

---

## 💫 Efectos Especiales

### Opacidades
```css
--vitrina-opacity-disabled: 0.5
--vitrina-opacity-hover: 0.8
--vitrina-opacity-loading: 0.6
--vitrina-opacity-overlay: 0.4
```

### Blur (Glassmorphism)
```css
--vitrina-blur-sm: 8px
--vitrina-blur: 12px
--vitrina-blur-md: 16px
--vitrina-blur-lg: 24px
--vitrina-blur-xl: 40px
```

Uso:
```css
backdrop-filter: blur(var(--vitrina-blur));
```

---

## 🎬 Animaciones Disponibles

### Definidas en common.css
```css
@keyframes fadeIn
@keyframes slideInDown
@keyframes slideInUp
@keyframes scaleIn
@keyframes spin  /* Para loading spinners */
```

### Uso
```css
animation: fadeIn 0.3s ease;
animation: slideInUp 0.4s var(--vitrina-ease-out);
```

---

## 📱 Responsive Breakpoints

```css
--vitrina-breakpoint-sm: 640px
--vitrina-breakpoint-md: 768px
--vitrina-breakpoint-lg: 1024px
--vitrina-breakpoint-xl: 1280px
--vitrina-breakpoint-2xl: 1536px
```

---

## ✅ Checklist para Aplicar Estilos Modernos

Al actualizar un componente, asegúrate de:

- [ ] Usar `var(--vitrina-radius-md)` o mayor para border-radius (mínimo 12px)
- [ ] Aplicar `var(--vitrina-shadow)` o superior en cards
- [ ] Usar `var(--vitrina-transition)` en elementos interactivos
- [ ] Agregar hover effects con `transform: translateY(-2px)`
- [ ] Usar gradientes predefinidos en botones principales
- [ ] Aplicar sombras de color en hover states
- [ ] Asegurar transiciones suaves (200-300ms)
- [ ] Usar timing functions apropiadas (ease-out para hover)
- [ ] Aplicar espaciado consistente con variables
- [ ] Usar tipografía con pesos semibold/bold para títulos

---

## 🔧 Utilidades CSS

### Disponibles en common.css
```css
.transition-all      /* Transición completa */
.transition-fast     /* Transición rápida */
.shadow-hover        /* Sombra en hover */
```

---

## 📚 Ejemplos de Uso

### Botón Moderno
```html
<button class="btn btn-primary btn-lg">
  <IconComponent />
  Texto del Botón
</button>
```

### Card Moderna
```html
<div class="card card-elevated">
  <div class="card-header">
    <h3 class="card-title">Título de la Card</h3>
  </div>
  <div class="card-content">
    <p>Contenido aquí...</p>
  </div>
</div>
```

### Badge
```html
<span class="badge badge-success">
  Activo
</span>
```

---

## 🎯 Siguientes Pasos

### Archivos Prioritarios para Actualizar

1. **Login.css / Register.css** - Ya están bien, solo ajustar border-radius
2. **Dashboard.css** - Aplicar nuevas sombras y radios
3. **CompanyMainDashboard.css** - Modernizar sidebar
4. **ProductsSection.css** - Actualizar tablas y modales
5. **OrdersSection.css** - El más grande, requiere atención especial
6. **IngredientsSection.css** - Aplicar nuevos estilos de cards

### Patrón de Actualización Recomendado

Para cada archivo:
1. Buscar todos los `border-radius` y actualizar a mínimo 12px
2. Reemplazar sombras con las nuevas variables
3. Agregar transiciones suaves (200-300ms)
4. Implementar hover effects con translateY
5. Usar gradientes en elementos destacados
6. Aplicar timing functions apropiadas

---

## 📄 Archivos Actualizados

- ✅ `variables.css` - Sistema completo de variables
- ✅ `common.css` - Componentes comunes modernizados
- ✅ `Landing.css` - Ya implementa el nuevo sistema
- ⏳ `index.css` - Pendiente
- ⏳ `Dashboard.css` - Pendiente
- ⏳ Otros componentes - Pendiente

---

**Fecha de actualización**: ${new Date().toLocaleDateString()}
**Versión del sistema de diseño**: 2.0
