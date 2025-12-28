# Types Organization

Esta carpeta contiene los **tipos compartidos** utilizados en toda la aplicación.

## Estructura

```
types/
├── models/           # Modelos de dominio compartidos
│   ├── Product.ts    # Tipos de productos
│   ├── Order.ts      # Tipos de pedidos
│   ├── Ingredient.ts # Tipos de ingredientes
│   ├── Company.ts    # Tipos de empresa y configuración
│   └── index.ts      # Barrel export
├── api/              # (Futuro) DTOs y tipos de API
├── ui/               # (Futuro) Tipos UI globales
├── google-maps.d.ts  # Declaraciones de Google Maps
└── index.ts          # Barrel export principal
```

## Convenciones

### ¿Qué va en `/types/models`?

**Modelos de dominio** que se usan en múltiples lugares de la aplicación:
- Entidades del backend (Product, Order, Ingredient, etc.)
- Interfaces base y sus extensiones
- Tipos de estado/enumeraciones compartidas

### ¿Qué va en tipos de sección? (ej: `ProductsSection/types`)

**Solo tipos específicos de UI de esa sección**:
- Props de componentes UI
- DTOs específicos de formularios
- Estados locales del componente
- Re-exports de modelos compartidos para conveniencia

## Reglas de Importación

### ✅ CORRECTO

```typescript
// Desde componentes de sección - importar de modelos compartidos
import { ProductWithExtras, Producto } from '@/types/models';

// Tipos UI locales desde la carpeta de la sección
import { ProductModalProps } from '../types';
```

### ❌ INCORRECTO

```typescript
// No duplicar definiciones de modelos en secciones
// Si el tipo se usa en >1 lugar, debe estar en /types/models
```

## Migración

Los tipos anteriores de las secciones ahora:
1. **Tipos de dominio** → Movidos a `/types/models`
2. **Tipos UI** → Permanecen en cada sección
3. **Re-exports** → Agregados para compatibilidad

Esto permite refactorizar gradualmente sin romper código existente.
