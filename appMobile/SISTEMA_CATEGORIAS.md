# Sistema de Categorías - App Mobile

## Descripción General

El sistema de categorías en la app móvil está diseñado para que las categorías y subcategorías estén **siempre disponibles en el contexto global** de la aplicación. Esto significa que puedes acceder a cualquier categoría por ID desde cualquier parte de la app sin necesidad de hacer llamadas API adicionales.

## Arquitectura

### 1. AppDataContext (Contexto Global)

Ubicación: `src/contexts/AppDataContext.tsx`

El contexto principal que mantiene el estado global de:
- **Categorías** con sus subcategorías
- **Ubicación GPS** del usuario
- **Ubicaciones guardadas** del usuario

Las categorías se cargan **automáticamente al iniciar la app** y quedan disponibles durante toda la sesión.

#### Funciones disponibles:

```typescript
// Obtener todas las categorías
const { categories, categoriesLoading, categoriesError } = useAppData();

// Buscar una categoría por ID
const category = getCategoryById('categoria-id');

// Buscar una subcategoría dentro de una categoría
const result = getSubcategoryById('categoria-id', 'subcategoria-id');
// result = { categoria: Categoria, subcategoria: Subcategoria }
```

### 2. Hooks Especializados

#### `useCategoryById(categoryId: string)`

Ubicación: `src/hooks/useCategoryById.ts`

Hook optimizado para obtener una categoría específica por ID desde el contexto global.

**Uso:**
```typescript
import { useCategoryById } from '../../src/hooks/useCategoryById';

function MiComponente() {
  const { category, loading, error, refresh } = useCategoryById(categoryId);

  // category incluye automáticamente todas sus subcategorías
  const subcategorias = category?.subcategorias || [];

  return (
    <View>
      <Text>{category?.nombre}</Text>
      {subcategorias.map(sub => (
        <Text key={sub.id}>{sub.nombre}</Text>
      ))}
    </View>
  );
}
```

#### `useSubcategoryById(categoryId: string, subcategoryId: string)`

Ubicación: `src/hooks/useSubcategoryById.ts`

Hook para obtener una subcategoría específica dentro de una categoría.

**Uso:**
```typescript
import { useSubcategoryById } from '../../src/hooks/useSubcategoryById';

function MiComponente() {
  const {
    subcategory,
    category,
    loading,
    error,
    refresh
  } = useSubcategoryById(categoryId, subcategoryId);

  return (
    <View>
      <Text>Categoría: {category?.nombre}</Text>
      <Text>Subcategoría: {subcategory?.nombre}</Text>
    </View>
  );
}
```

#### `useCategories()`

Ubicación: `src/hooks/useCategories.ts`

Hook simplificado que re-exporta el acceso a categorías desde AppDataContext.

**Uso:**
```typescript
import { useCategories } from '../../src/hooks/useCategories';

function MiComponente() {
  const { categories, loading, error, refresh } = useCategories();

  return (
    <View>
      {categories.map(cat => (
        <Text key={cat.id}>{cat.nombre}</Text>
      ))}
    </View>
  );
}
```

## Flujo de Navegación

### 1. Home → Categoría → Subcategoría → Empresa

```typescript
// En Home (app/(tabs)/index.tsx)
const handleCategoryPress = (categoryId: string, categoryName: string) => {
  router.push({
    pathname: '/category/[id]',
    params: { id: categoryId, name: categoryName },
  });
};

// En Category (app/category/[id].tsx)
const { id } = useLocalSearchParams();
const { category } = useCategoryById(id);

// Navegar a subcategoría
const handleSubcategoryPress = (subcategory) => {
  router.push({
    pathname: '/subcategory/[id]',
    params: {
      id: subcategory.id,
      categoryId: category.id,
      name: subcategory.nombre,
      categoryName: category.nombre,
    },
  });
};

// En Subcategory (app/subcategory/[id].tsx)
const { id, categoryId } = useLocalSearchParams();
const { subcategory, category } = useSubcategoryById(categoryId, id);
```

## Ventajas del Sistema

1. **Performance Óptimo**: Las categorías se cargan una sola vez al inicio
2. **Acceso Instantáneo**: No hay delay al navegar entre categorías
3. **Código Limpio**: Hooks especializados simplifican el acceso a datos
4. **Tipo Seguro**: TypeScript proporciona autocomplete y validación
5. **Mantenible**: Toda la lógica está centralizada en el contexto

## Estructura de Datos

```typescript
interface Categoria {
  id: string;
  nombre: string;
  icono?: string;
  orden: number;
  activo: boolean;
  subcategorias?: Subcategoria[];
}

interface Subcategoria {
  id: string;
  nombre: string;
  categoriaId: string;
  icono?: string;
  orden: number;
  activo: boolean;
}
```

## Ejemplos de Uso

### Ejemplo 1: Mostrar todas las categorías

```typescript
import { useCategories } from '../../src/hooks/useCategories';

function CategoriesGrid() {
  const { categories, loading, error, refresh } = useCategories();

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CategoryCard category={item} />
      )}
    />
  );
}
```

### Ejemplo 2: Mostrar una categoría específica con sus subcategorías

```typescript
import { useCategoryById } from '../../src/hooks/useCategoryById';

function CategoryDetail({ categoryId }) {
  const { category, loading } = useCategoryById(categoryId);

  if (loading) return <ActivityIndicator />;
  if (!category) return <Text>Categoría no encontrada</Text>;

  return (
    <View>
      <Text>{category.nombre}</Text>
      {category.subcategorias?.map(sub => (
        <SubcategoryCard key={sub.id} subcategory={sub} />
      ))}
    </View>
  );
}
```

### Ejemplo 3: Acceso directo desde el contexto

```typescript
import { useAppData } from '../../src/contexts/AppDataContext';

function MyComponent() {
  const { categories, getCategoryById } = useAppData();

  // Buscar categoría directamente
  const category = getCategoryById('some-id');

  // O iterar sobre todas las categorías
  categories.forEach(cat => {
    console.log(cat.nombre, cat.subcategorias?.length);
  });
}
```

## Refresh/Actualización de Datos

Para actualizar las categorías desde el backend:

```typescript
import { useCategories } from '../../src/hooks/useCategories';

function MyComponent() {
  const { refresh } = useCategories();

  const handleRefresh = async () => {
    await refresh();
  };

  return (
    <Button onPress={handleRefresh}>
      Actualizar Categorías
    </Button>
  );
}
```

## Troubleshooting

### Problema: "Category not found"
**Solución**: Asegúrate de que las categorías ya se hayan cargado verificando `loading`:

```typescript
const { category, loading } = useCategoryById(id);

if (loading) {
  return <ActivityIndicator />;
}

if (!category) {
  return <Text>Categoría no encontrada</Text>;
}
```

### Problema: Subcategorías no aparecen
**Solución**: Verifica que el backend esté devolviendo las subcategorías en el endpoint `/categorias`:

```bash
curl http://localhost:3000/api/categorias
```

Las subcategorías deben estar incluidas en la respuesta de cada categoría.

## API Backend

### GET /categorias
Retorna todas las categorías activas con sus subcategorías.

```json
[
  {
    "id": "cat-1",
    "nombre": "Restaurantes",
    "icono": "🍔",
    "orden": 1,
    "activo": true,
    "subcategorias": [
      {
        "id": "sub-1",
        "nombre": "Pizza",
        "categoriaId": "cat-1",
        "icono": "🍕",
        "orden": 1,
        "activo": true
      }
    ]
  }
]
```

### GET /categorias/:id
Retorna una categoría específica con sus subcategorías.

## Resumen

Este sistema de categorías proporciona:
- ✅ Carga automática al inicio
- ✅ Acceso instantáneo por ID
- ✅ Hooks especializados para casos comunes
- ✅ Navegación fluida entre pantallas
- ✅ Código tipo-seguro con TypeScript
- ✅ Performance óptimo (sin llamadas redundantes)
