# Ejemplos Prácticos - Sistema de Categorías

Este documento contiene ejemplos reales de cómo usar el sistema de categorías en diferentes escenarios.

## Ejemplo 1: Crear una pantalla de búsqueda con filtros por categoría

```typescript
import React, { useState, useMemo } from 'react';
import { View, TextInput, FlatList } from 'react-native';
import { useCategories } from '../src/hooks/useCategories';
import { useCompanies } from '../src/hooks/useCompanies';

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { categories } = useCategories();
  const { companies } = useCompanies();

  // Filtrar empresas por categoría y término de búsqueda
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = company.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategoryId
        ? company.categoriaId === selectedCategoryId
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [companies, searchTerm, selectedCategoryId]);

  return (
    <View>
      {/* Buscador */}
      <TextInput
        placeholder="Buscar empresas..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Filtros por categoría */}
      <FlatList
        horizontal
        data={categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategoryId(item.id)}
            style={{
              backgroundColor: selectedCategoryId === item.id ? 'blue' : 'gray'
            }}
          >
            <Text>{item.nombre}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Resultados */}
      <FlatList
        data={filteredCompanies}
        renderItem={({ item }) => <CompanyCard company={item} />}
      />
    </View>
  );
}
```

## Ejemplo 2: Widget de categorías destacadas en el Home

```typescript
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useCategories } from '../src/hooks/useCategories';
import { useRouter } from 'expo-router';

export function FeaturedCategories() {
  const { categories, loading } = useCategories();
  const router = useRouter();

  // Mostrar solo las primeras 6 categorías
  const featuredCategories = categories.slice(0, 6);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text style={styles.title}>Categorías Destacadas</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {featuredCategories.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => {
              router.push({
                pathname: '/category/[id]',
                params: { id: category.id, name: category.nombre }
              });
            }}
            style={styles.categoryCard}
          >
            <Text style={styles.icon}>{category.icono}</Text>
            <Text style={styles.name}>{category.nombre}</Text>
            <Text style={styles.count}>
              {category.subcategorias?.length || 0} subcategorías
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
```

## Ejemplo 3: Breadcrumb de navegación

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useCategoryById } from '../src/hooks/useCategoryById';
import { useSubcategoryById } from '../src/hooks/useSubcategoryById';

interface BreadcrumbProps {
  categoryId?: string;
  subcategoryId?: string;
}

export function Breadcrumb({ categoryId, subcategoryId }: BreadcrumbProps) {
  const router = useRouter();
  const { category } = useCategoryById(categoryId);
  const { subcategory } = useSubcategoryById(categoryId, subcategoryId);

  return (
    <View style={styles.breadcrumb}>
      <TouchableOpacity onPress={() => router.push('/')}>
        <Text style={styles.link}>Home</Text>
      </TouchableOpacity>

      {category && (
        <>
          <Text style={styles.separator}>/</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/category/[id]',
                params: { id: category.id, name: category.nombre }
              })
            }
          >
            <Text style={styles.link}>{category.nombre}</Text>
          </TouchableOpacity>
        </>
      )}

      {subcategory && (
        <>
          <Text style={styles.separator}>/</Text>
          <Text style={styles.current}>{subcategory.nombre}</Text>
        </>
      )}
    </View>
  );
}
```

## Ejemplo 4: Selector de categoría en formulario

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useCategories } from '../src/hooks/useCategories';

export function CategoryPicker({ onSelect, selectedId }) {
  const [modalVisible, setModalVisible] = useState(false);
  const { categories, loading } = useCategories();

  const selectedCategory = categories.find(c => c.id === selectedId);

  return (
    <View>
      <Text>Seleccionar Categoría</Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.pickerButton}
      >
        <Text>
          {selectedCategory?.nombre || 'Selecciona una categoría...'}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Categorías</Text>
          <FlatList
            data={categories}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item.id);
                  setModalVisible(false);
                }}
                style={styles.categoryOption}
              >
                <Text style={styles.icon}>{item.icono}</Text>
                <Text style={styles.name}>{item.nombre}</Text>
                {selectedId === item.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}
          >
            <Text>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
```

## Ejemplo 5: Estadísticas de categorías

```typescript
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useCategories } from '../src/hooks/useCategories';
import { useCompanies } from '../src/hooks/useCompanies';

export function CategoryStats() {
  const { categories } = useCategories();
  const { companies } = useCompanies();

  // Calcular estadísticas por categoría
  const stats = categories.map(category => {
    const companiesCount = companies.filter(
      c => c.categoriaId === category.id
    ).length;

    const subcategoriesCount = category.subcategorias?.length || 0;

    return {
      ...category,
      companiesCount,
      subcategoriesCount,
    };
  });

  // Ordenar por número de empresas
  const sortedStats = [...stats].sort(
    (a, b) => b.companiesCount - a.companiesCount
  );

  return (
    <View>
      <Text style={styles.title}>Estadísticas por Categoría</Text>
      <FlatList
        data={sortedStats}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.statRow}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <Text style={styles.icon}>{item.icono}</Text>
            <View style={styles.statInfo}>
              <Text style={styles.statName}>{item.nombre}</Text>
              <Text style={styles.statDetails}>
                {item.companiesCount} empresas • {item.subcategoriesCount} subcategorías
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
```

## Ejemplo 6: Navegación profunda con deep linking

```typescript
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAppData } from '../src/contexts/AppDataContext';

/**
 * Hook para manejar deep links a categorías
 * Ejemplo: vitrina://category/cat-id-123
 */
export function useCategoryDeepLink(url: string) {
  const router = useRouter();
  const { getCategoryById, categoriesLoading } = useAppData();

  useEffect(() => {
    if (categoriesLoading) return;

    // Parse URL
    const match = url.match(/category\/([^\/]+)/);
    if (!match) return;

    const categoryId = match[1];
    const category = getCategoryById(categoryId);

    if (category) {
      router.push({
        pathname: '/category/[id]',
        params: { id: category.id, name: category.nombre }
      });
    } else {
      console.warn('Categoría no encontrada:', categoryId);
    }
  }, [url, categoriesLoading]);
}
```

## Ejemplo 7: Caché local con AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useAppData } from '../src/contexts/AppDataContext';

const CATEGORIES_CACHE_KEY = '@vitrina:categories';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 horas

/**
 * Hook para guardar categorías en caché local
 */
export function useCategoriesCache() {
  const { categories, categoriesLoading } = useAppData();

  // Guardar en caché cuando las categorías se carguen
  useEffect(() => {
    if (!categoriesLoading && categories.length > 0) {
      const cacheData = {
        categories,
        timestamp: Date.now(),
      };
      AsyncStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(cacheData));
    }
  }, [categories, categoriesLoading]);

  // Cargar desde caché al iniciar
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem(CATEGORIES_CACHE_KEY);
        if (cached) {
          const { categories, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;

          if (age < CACHE_DURATION) {
            console.log('Categorías cargadas desde caché');
            // Aquí podrías actualizar el estado si lo necesitas
          } else {
            console.log('Caché expirado, limpiando...');
            AsyncStorage.removeItem(CATEGORIES_CACHE_KEY);
          }
        }
      } catch (error) {
        console.error('Error al cargar caché:', error);
      }
    };

    loadCache();
  }, []);
}
```

## Ejemplo 8: Categorías con animaciones

```typescript
import React from 'react';
import { View, Animated, TouchableOpacity } from 'react-native';
import { useCategories } from '../src/hooks/useCategories';

export function AnimatedCategoryGrid() {
  const { categories, loading } = useCategories();
  const animations = React.useRef(
    categories.map(() => new Animated.Value(0))
  ).current;

  React.useEffect(() => {
    if (!loading) {
      // Animar entrada escalonada
      Animated.stagger(
        100,
        animations.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          })
        )
      ).start();
    }
  }, [loading]);

  if (loading) return <ActivityIndicator />;

  return (
    <View style={styles.grid}>
      {categories.map((category, index) => {
        const scale = animations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        });

        const opacity = animations[index];

        return (
          <Animated.View
            key={category.id}
            style={[
              styles.categoryCard,
              {
                opacity,
                transform: [{ scale }],
              },
            ]}
          >
            <TouchableOpacity>
              <Text>{category.icono}</Text>
              <Text>{category.nombre}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}
```

## Tips y Mejores Prácticas

1. **Siempre verifica `loading`** antes de renderizar datos de categorías
2. **Usa `useMemo`** para cálculos derivados (filtros, búsquedas, etc.)
3. **Implementa manejo de errores** con los estados `error`
4. **Proporciona feedback visual** durante la carga y actualización
5. **Usa TypeScript** para aprovechar el autocompletado y type safety
6. **Implementa caché local** para mejorar la UX offline
7. **Log de debug** para troubleshooting durante desarrollo

## Debugging

Para verificar el estado de las categorías en cualquier momento:

```typescript
import { useAppData } from '../src/contexts/AppDataContext';

function DebugPanel() {
  const { categories, categoriesLoading, categoriesError } = useAppData();

  console.log('=== CATEGORÍAS DEBUG ===');
  console.log('Total categorías:', categories.length);
  console.log('Loading:', categoriesLoading);
  console.log('Error:', categoriesError);

  categories.forEach(cat => {
    console.log(`- ${cat.nombre} (${cat.id})`);
    console.log(`  Subcategorías: ${cat.subcategorias?.length || 0}`);
  });
}
```
