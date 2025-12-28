/**
 * Tests for useProducts hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import useProducts from '../useProducts';
import * as productosService from '../../../../../../services/productosService';

// Mock del servicio
jest.mock('../../../../../../services/productosService');

const mockProductosService = productosService as jest.Mocked<typeof productosService>;

describe('useProducts', () => {
  const mockUser = {
    id: 'empresa-123',
    email: 'test@empresa.com',
    userType: 'empresa',
  };

  const mockProducts = [
    {
      id: '1',
      nombre: 'Producto 1',
      descripcion: 'Descripción 1',
      precio: 100,
      empresaId: 'empresa-123',
      activo: true,
      fotoUrl: 'https://example.com/foto1.jpg',
    },
    {
      id: '2',
      nombre: 'Producto 2',
      descripcion: 'Descripción 2',
      precio: 200,
      empresaId: 'empresa-123',
      activo: false,
      fotoUrl: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe inicializar con estado vacío', () => {
    mockProductosService.getProductos.mockResolvedValue([]);

    const { result } = renderHook(() => useProducts(mockUser));

    expect(result.current.products).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('debe cargar productos exitosamente', async () => {
    mockProductosService.getProductos.mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProducts(mockUser));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.error).toBeNull();
    expect(mockProductosService.getProductos).toHaveBeenCalledWith('empresa-123');
  });

  it('debe manejar errores al cargar productos', async () => {
    const errorMessage = 'Error al cargar productos';
    mockProductosService.getProductos.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useProducts(mockUser));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('debe calcular estadísticas correctamente', async () => {
    mockProductosService.getProductos.mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProducts(mockUser));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toEqual({
      total: 2,
      activos: 1,
      inactivos: 1,
    });
  });

  it('debe filtrar productos por búsqueda', async () => {
    mockProductosService.getProductos.mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProducts(mockUser));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSearchQuery('Producto 1');
    });

    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0].nombre).toBe('Producto 1');
  });

  it('debe filtrar productos por estado activo', async () => {
    mockProductosService.getProductos.mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProducts(mockUser));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setFilterStatus('activos');
    });

    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0].activo).toBe(true);
  });

  // TODO: Agregar más tests
  // - Test para createProduct
  // - Test para updateProduct
  // - Test para deleteProduct
  // - Test para uploadProductImage
  // - Test para manejo de categorías
});
