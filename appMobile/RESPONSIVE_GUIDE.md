# Guía de Migración a Estilos Responsive

## ✅ Cambios Completados

### 1. Sistema de Utilidades Responsive
- ✅ Creado `src/utils/responsive.ts` con funciones `normalize()`, `responsiveFontSize()`, `responsiveSpacing()`
- ✅ Detección automática de plataforma (web vs móvil)
- ✅ Escalado automático en web: Desktop (+40%), Tablet (+20%), Mobile Web (+15%)

### 2. Theme System Actualizado
- ✅ `src/theme/spacing.ts` - Usa `responsiveSpacing()` en todos los valores
- ✅ `src/theme/typography.ts` - Usa `responsiveFontSize()` en fontSizes y lineHeights

### 3. Componentes Actualizados
- ✅ `src/components/common/Input.tsx`
- ✅ `src/components/common/Card.tsx`
- ✅ `src/components/common/Button.tsx`
- ✅ `src/components/categories/CategoryCard.tsx`
- ✅ `src/components/products/ProductCard.tsx`
- ✅ `src/components/cart/CartItem.tsx`

### 4. Pantallas Actualizadas
- ✅ `app/(tabs)/index.tsx` (Home)

## 🔄 Patrón de Migración

### Importar utilidad responsive
```typescript
import { normalize } from '../../src/utils/responsive';
```

### Actualizar valores fijos
```typescript
// Antes
fontSize: 14,
width: 40,
height: 40,
borderRadius: 12,
padding: 16,
marginTop: 8,

// Después
fontSize: normalize(14),
width: normalize(40),
height: normalize(40),
borderRadius: normalize(12),
padding: spacing.md,  // Ya es responsive
marginTop: spacing.sm,  // Ya es responsive
```

### Actualizar tamaños de íconos
```typescript
// Antes
<Ionicons name="menu" size={20} />

// Después
<Ionicons name="menu" size={normalize(20)} />
```

## 📋 Archivos Pendientes de Actualizar

### Pantallas Principales
- [ ] `app/(tabs)/cart.tsx`
- [ ] `app/(tabs)/profile.tsx`
- [ ] `app/(tabs)/orders.tsx`
- [ ] `app/(tabs)/notifications.tsx`
- [ ] `app/checkout.tsx`
- [ ] `app/company/[id].tsx`
- [ ] `app/category/[id].tsx`
- [ ] `app/order/[id].tsx`
- [ ] `app/locations.tsx`
- [ ] `app/locations/edit/[id].tsx`
- [ ] `app/auth/login.tsx`
- [ ] `app/auth/register.tsx`

### Componentes de Navegación
- [ ] `src/components/navigation/GlassTabBar.tsx`
- [ ] `src/components/navigation/MenuDrawer.tsx`
- [ ] `src/components/navigation/LocationsDrawer.tsx`
- [ ] `src/components/navigation/BaseDrawer.tsx`

### Componentes de Órdenes
- [ ] `src/components/orders/OrderCard.tsx`
- [ ] `src/components/orders/OrderTimeline.tsx`
- [ ] `src/components/orders/OrderStatusBadge.tsx`
- [ ] `src/components/orders/OrderStatusTimeline.tsx`
- [ ] `src/components/orders/ActiveOrderCard.tsx`
- [ ] `src/components/orders/DeliveryTrackingMap.tsx`

### Otros Componentes
- [ ] `src/components/cart/CartSummary.tsx`
- [ ] `src/components/cart/FloatingCartButton.tsx`
- [ ] `src/components/companies/FloatingSocialLinks.tsx`
- [ ] `src/components/companies/BusinessHours.tsx`
- [ ] `src/components/products/ProductModal.tsx`
- [ ] `src/components/notifications/NotificationPopup.tsx`
- [ ] `src/components/common/Toast.tsx`
- [ ] `src/components/common/EmptyState.tsx`
- [ ] `src/components/common/SearchBar.tsx`
- [ ] `src/components/common/Logo.tsx`
- [ ] `src/components/common/LocationPicker.tsx`
- [ ] `src/components/common/SimpleLocationPicker.tsx`
- [ ] `src/components/common/MapViewUniversal.tsx`

## 🎯 Prioridad de Actualización

### Alta Prioridad (UI Principal)
1. Tab Bar (`GlassTabBar.tsx`)
2. Pantalla de Carrito (`cart.tsx`)
3. Pantalla de Perfil (`profile.tsx`)
4. Modales de Productos (`ProductModal.tsx`)
5. Drawers de Navegación

### Media Prioridad
1. Pantallas de Órdenes
2. Componentes de Empresa
3. Sistema de Notificaciones

### Baja Prioridad
1. Pantallas de Autenticación (ya funcionan bien)
2. Componentes de Mapas

## 📝 Notas Importantes

- Los valores de `spacing`, `fontSizes`, `lineHeights`, y `borderRadius` del theme YA son responsive
- Solo necesitas usar `normalize()` para valores hardcodeados fuera del theme
- Los íconos de Ionicons necesitan `normalize()` en su prop `size`
- En web, todo se ve automáticamente más grande (15-40% dependiendo del dispositivo)
