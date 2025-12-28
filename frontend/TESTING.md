# Testing Guide

Guía para ejecutar y escribir tests en el frontend de Vitrina.

## 🚀 Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm test -- --watch

# Ejecutar tests con coverage
npm test -- --coverage

# Ejecutar un archivo específico
npm test -- useProducts.test.ts
```

## 📁 Estructura de Tests

```
src/
├── components/
│   └── dashboard/
│       └── sections/
│           └── ProductsSection/
│               ├── hooks/
│               │   ├── useProducts.ts
│               │   └── __tests__/
│               │       └── useProducts.test.ts
│               └── components/
│                   ├── ProductCard.tsx
│                   └── __tests__/
│                       └── ProductCard.test.tsx
```

## ✅ Convenciones

### Ubicación de Tests
- Tests de **hooks**: `hooks/__tests__/hookName.test.ts`
- Tests de **componentes**: `components/__tests__/ComponentName.test.tsx`
- Tests de **utilities**: `utils/__tests__/utilityName.test.ts`
- Tests de **services**: `services/__tests__/serviceName.test.ts`

### Nomenclatura
- Archivos de test: `*.test.ts` o `*.test.tsx`
- Describe blocks: Usar el nombre del componente/hook/función
- Test cases: Empezar con "debe..." (ej: "debe cargar productos exitosamente")

## 🧪 Ejemplo de Test para Hook

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import useProducts from '../useProducts';

jest.mock('../../services/productosService');

describe('useProducts', () => {
  it('debe cargar productos exitosamente', async () => {
    // Arrange
    const mockProducts = [{ id: '1', nombre: 'Test' }];
    mockService.getProductos.mockResolvedValue(mockProducts);

    // Act
    const { result } = renderHook(() => useProducts(mockUser));

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.products).toEqual(mockProducts);
  });
});
```

## 🎨 Ejemplo de Test para Componente

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    nombre: 'Test Product',
    precio: 100,
  };

  it('debe renderizar información del producto', () => {
    // Arrange & Act
    render(<ProductCard product={mockProduct} onEdit={jest.fn()} />);

    // Assert
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('debe llamar onEdit al hacer click en editar', () => {
    // Arrange
    const onEdit = jest.fn();
    render(<ProductCard product={mockProduct} onEdit={onEdit} />);

    // Act
    fireEvent.click(screen.getByRole('button', { name: /editar/i }));

    // Assert
    expect(onEdit).toHaveBeenCalledWith(mockProduct);
  });
});
```

## 🛠️ Utilidades de Testing

### Mocks Comunes

```typescript
// Mock de usuario
const mockUser = {
  id: 'empresa-123',
  email: 'test@empresa.com',
  userType: 'empresa',
};

// Mock de servicio
jest.mock('../../services/productosService', () => ({
  getProductos: jest.fn(),
  createProducto: jest.fn(),
  updateProducto: jest.fn(),
  deleteProducto: jest.fn(),
}));

// Mock de context
const mockAuthContext = {
  user: mockUser,
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn(),
};
```

### Custom Render con Providers

```typescript
import { render } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';

function renderWithAuth(ui: React.ReactElement) {
  return render(
    <AuthProvider value={mockAuthContext}>
      {ui}
    </AuthProvider>
  );
}
```

## 📊 Coverage

Meta de cobertura:
- **Hooks críticos**: 80%+
- **Componentes UI**: 60%+
- **Services**: 80%+
- **Utilities**: 90%+

Ver coverage:
```bash
npm test -- --coverage --watchAll=false
```

## 🔍 Debugging Tests

```typescript
import { screen } from '@testing-library/react';

// Ver el DOM actual
screen.debug();

// Ver un elemento específico
screen.debug(screen.getByRole('button'));

// Queries disponibles
screen.getByText('texto');        // Arroja error si no existe
screen.queryByText('texto');      // Retorna null si no existe
screen.findByText('texto');       // Async, espera a que aparezca
```

## 📚 Recursos

- [React Testing Library](https://testing-library.com/react)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## TODO: Tests Pendientes

### Alta Prioridad
- [ ] `useProducts` - Tests completos CRUD
- [ ] `useOrders` - Tests completos CRUD
- [ ] `useAuth` - Tests de autenticación
- [ ] `useAccountConfig` - Tests de configuración

### Media Prioridad
- [ ] `ProductModal` - Tests de formulario
- [ ] `OrderCard` - Tests de UI
- [ ] `ErrorBoundary` - Tests de error handling

### Baja Prioridad
- [ ] Services - Tests de API
- [ ] Utilities - Tests de helpers
- [ ] Components - Tests de UI restantes
