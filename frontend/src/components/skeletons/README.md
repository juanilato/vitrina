# Sistema de Skeleton Loading

Sistema centralizado de skeleton loading para todas las secciones del frontend de Vitrina.

## 📁 Estructura

```
skeletons/
├── SkeletonBase.css              # Estilos base y animaciones
├── index.ts                      # Exportaciones centralizadas
│
├── Componentes Base (Reutilizables)
├── SkeletonCard.tsx              # Cards genéricos
├── SkeletonTable.tsx             # Tablas
├── SkeletonList.tsx              # Listas
├── SkeletonStat.tsx              # Tarjetas de estadísticas
├── SkeletonForm.tsx              # Formularios
│
└── Componentes Específicos por Sección
    ├── StatsSectionSkeleton.tsx              # Dashboard de estadísticas (Admin/Vendedor)
    ├── AccountConfigSectionSkeleton.tsx      # Configuración de cuenta (Admin/Vendedor)
    ├── IngredientsSectionSkeleton.tsx        # Gestión de ingredientes (Admin/Vendedor)
    ├── TomaPedidosSectionSkeleton.tsx        # Toma de pedidos (Repartidor)
    ├── RepartidorOrdersSectionSkeleton.tsx   # Pedidos asignados (Repartidor)
    ├── VinculacionSectionSkeleton.tsx        # Vinculaciones (Repartidor)
    └── NotificationsSectionSkeleton.tsx      # Notificaciones (Todos)
```

## 🎨 Componentes Base

### SkeletonCard

Card genérico con imagen, texto y botones.

```tsx
import { SkeletonCard } from '@/components/skeletons';

<SkeletonCard
  hasImage={true}
  imageAspectRatio="square"  // 'square' | 'wide' | 'default'
  lines={3}
  hasBadge={true}
  hasButton={true}
/>
```

### SkeletonTable

Tabla con filas y columnas personalizables.

```tsx
import { SkeletonTable } from '@/components/skeletons';

<SkeletonTable
  rows={5}
  columns={4}
  hasHeader={true}
  hasActions={true}
/>
```

### SkeletonList

Lista de items con avatares, iconos y badges.

```tsx
import { SkeletonList } from '@/components/skeletons';

<SkeletonList
  items={5}
  hasAvatar={true}
  hasIcon={false}
  hasBadge={true}
  lines={2}
/>
```

### SkeletonStat

Tarjeta de estadística.

```tsx
import { SkeletonStat } from '@/components/skeletons';

<SkeletonStat
  variant="card"        // 'card' | 'inline'
  hasIcon={true}
  hasTrend={true}
/>
```

### SkeletonForm

Formulario con campos, textareas y botones.

```tsx
import { SkeletonForm } from '@/components/skeletons';

<SkeletonForm
  fields={4}
  hasTextarea={true}
  hasSelect={true}
  hasImageUpload={true}
  hasButtons={true}
  columns={2}           // 1 | 2
/>
```

## 📋 Skeletons Específicos por Sección

### StatsSection (Admin/Vendedor)

```tsx
import { StatsSectionSkeleton } from '@/components/skeletons';

{isLoading ? <StatsSectionSkeleton /> : <StatsContent />}
```

**Incluye:**
- Stats principales (4 cards)
- Gráfico principal
- Stats secundarias
- Productos más vendidos
- Pedidos recientes

---

### AccountConfigSection (Admin/Vendedor)

```tsx
import { AccountConfigSectionSkeleton } from '@/components/skeletons';

{isLoading ? (
  <AccountConfigSectionSkeleton activeTab="profile" />
) : (
  <AccountConfigContent />
)}
```

**Props:**
- `activeTab`: 'profile' | 'categories' | 'shipping' | 'repartidores' | 'preferences' | 'subscription'

**Incluye skeletons para:**
- ProfileTab: Perfil y seguridad
- CategoriesTab: Categorías y subcategorías
- ShippingTab: Precios de envío con mapa
- RepartidoresTab: Tabla de repartidores
- PreferencesTab: Preferencias de vitrina
- SubscriptionTab: Planes de suscripción

---

### IngredientsSection (Admin/Vendedor)

```tsx
import { IngredientsSectionSkeleton } from '@/components/skeletons';

{isLoading ? <IngredientsSectionSkeleton /> : <IngredientsContent />}
```

**Incluye:**
- Sidebar con búsqueda y filtros
- Tabla de ingredientes
- Paginación

---

### TomaPedidosSection (Repartidor)

```tsx
import { TomaPedidosSectionSkeleton } from '@/components/skeletons';

{isLoading ? <TomaPedidosSectionSkeleton /> : <TomaPedidosContent />}
```

**Incluye:**
- Header con estado WebSocket
- Filtros rápidos
- Stats rápidas
- Grid de pedidos disponibles
- Mensaje de ayuda

---

### RepartidorOrdersSection (Repartidor)

```tsx
import { RepartidorOrdersSectionSkeleton } from '@/components/skeletons';

{isLoading ? <RepartidorOrdersSectionSkeleton /> : <RepartidorOrdersContent />}
```

**Incluye:**
- Header con estado WebSocket
- Tabs de estado
- Lista de pedidos asignados
- Mapa de tracking GPS
- Historial reciente

---

### VinculacionSection (Repartidor)

```tsx
import { VinculacionSectionSkeleton } from '@/components/skeletons';

{isLoading ? <VinculacionSectionSkeleton /> : <VinculacionContent />}
```

**Incluye:**
- Header con estado WebSocket
- Tabs de vinculaciones
- Stats rápidas
- Grid de empresas vinculadas
- Alerta de solicitudes pendientes

---

### NotificationsSection (Todos)

```tsx
import { NotificationsSectionSkeleton } from '@/components/skeletons';

{isLoading ? <NotificationsSectionSkeleton /> : <NotificationsContent />}
```

**Incluye:**
- Header con contador
- Filtros y búsqueda
- Stats por tipo
- Lista de notificaciones
- Paginación
- Banner de ayuda

---

## 🎯 Uso en las Secciones

### Ejemplo: StatsSection

```tsx
// frontend/src/components/dashboard/sections/StatsSection/index.tsx

import { StatsSectionSkeleton } from '@/components/skeletons';

const StatsSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats().then((data) => {
      setStats(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <StatsSectionSkeleton />;
  }

  return (
    <div className="stats-section">
      {/* Contenido real */}
    </div>
  );
};
```

### Ejemplo: AccountConfigSection con tabs

```tsx
// frontend/src/components/dashboard/sections/AccountConfigSection/index.tsx

import { AccountConfigSectionSkeleton } from '@/components/skeletons';

const AccountConfigSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <AccountConfigSectionSkeleton activeTab={activeTab} />;
  }

  return (
    <div className="account-config-section">
      {/* Tabs y contenido real */}
    </div>
  );
};
```

## 🎨 Clases CSS Útiles

### Animaciones
- `.skeleton` - Animación shimmer (recomendada)
- `.skeleton-pulse` - Animación de pulso

### Textos
- `.skeleton-text` - Texto base (16px)
- `.skeleton-text.large` - Texto grande (24px)
- `.skeleton-text.small` - Texto pequeño (12px)
- `.skeleton-text.title` - Título (32px, ancho 60%)

### Botones
- `.skeleton-button` - Botón base (120px)
- `.skeleton-button.wide` - Botón ancho (100%)
- `.skeleton-button.small` - Botón pequeño (80px)

### Imágenes
- `.skeleton-image` - Imagen 4:3
- `.skeleton-image.square` - Imagen 1:1
- `.skeleton-image.wide` - Imagen 16:9

### Avatares
- `.skeleton-avatar` - Avatar base (40px)
- `.skeleton-avatar.large` - Avatar grande (80px)
- `.skeleton-avatar.small` - Avatar pequeño (24px)

### Iconos
- `.skeleton-icon` - Icono base (24px)
- `.skeleton-icon.large` - Icono grande (48px)
- `.skeleton-icon.small` - Icono pequeño (16px)

### Layouts
- `.skeleton-flex` - Flexbox horizontal
- `.skeleton-flex.column` - Flexbox vertical
- `.skeleton-grid` - Grid base
- `.skeleton-grid.cols-2` - Grid 2 columnas
- `.skeleton-grid.cols-3` - Grid 3 columnas
- `.skeleton-grid.cols-4` - Grid 4 columnas

### Spacing
- `.skeleton-mb-1` - margin-bottom: 8px
- `.skeleton-mb-2` - margin-bottom: 16px
- `.skeleton-mb-3` - margin-bottom: 24px
- `.skeleton-mt-1` - margin-top: 8px
- `.skeleton-mt-2` - margin-top: 16px
- `.skeleton-mt-3` - margin-top: 24px

### Width
- `.skeleton-w-25` - width: 25%
- `.skeleton-w-50` - width: 50%
- `.skeleton-w-75` - width: 75%
- `.skeleton-w-100` - width: 100%

## 🔧 Personalización

### Crear un skeleton personalizado

```tsx
import React from 'react';
import { SkeletonCard, SkeletonTable } from '@/components/skeletons';
import '../skeletons/SkeletonBase.css';

export const MyCustomSkeleton: React.FC = () => {
  return (
    <div className="my-custom-skeleton">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div className="skeleton skeleton-text title skeleton-mb-2" />
        <div className="skeleton skeleton-text" style={{ width: '60%' }} />
      </div>

      {/* Grid de cards */}
      <div className="skeleton-grid cols-3" style={{ gap: '20px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} hasImage hasButton lines={2} />
        ))}
      </div>

      {/* Tabla */}
      <SkeletonTable rows={5} columns={4} hasHeader />
    </div>
  );
};
```

## 📱 Responsive

Los skeletons son responsive por defecto. En mobile (< 768px):
- Los grids de múltiples columnas se convierten a 1 columna
- Los layouts de 2 columnas se apilan verticalmente
- Los textos se adaptan automáticamente

## ⚡ Performance

- Las animaciones usan `transform` y `opacity` para mejor rendimiento
- Los skeletons son componentes ligeros sin lógica pesada
- Se recomienda mostrar el skeleton mientras `isLoading === true`

## 🎯 Mejores Prácticas

1. **Siempre usa skeletons para operaciones asíncronas**
   ```tsx
   {isLoading ? <MySkeleton /> : <MyContent />}
   ```

2. **Mantén consistencia visual**
   - El skeleton debe parecerse al contenido real
   - Usa las mismas dimensiones y layouts

3. **No uses spinners genéricos**
   - Los skeletons mejoran la UX mostrando la estructura esperada

4. **Combina componentes base**
   - Usa `SkeletonCard`, `SkeletonTable`, etc. para crear skeletons complejos

5. **Tiempo mínimo de skeleton**
   - Si la carga es muy rápida (< 300ms), considera no mostrar el skeleton

## 🚀 Migración desde spinners

**Antes:**
```tsx
{isLoading && <div className="loading-spinner">Cargando...</div>}
{!isLoading && <MyContent />}
```

**Después:**
```tsx
{isLoading ? <MySectionSkeleton /> : <MyContent />}
```

## 📦 Exportaciones

Todos los componentes se exportan desde el index principal:

```tsx
import {
  // Base
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  SkeletonStat,
  SkeletonForm,

  // Secciones
  StatsSectionSkeleton,
  AccountConfigSectionSkeleton,
  IngredientsSectionSkeleton,
  TomaPedidosSectionSkeleton,
  RepartidorOrdersSectionSkeleton,
  VinculacionSectionSkeleton,
  NotificationsSectionSkeleton,
} from '@/components/skeletons';
```

---

## 📞 Soporte

Si necesitas crear un nuevo skeleton o personalizar uno existente, revisa los componentes base en esta carpeta y sigue los patrones establecidos.
