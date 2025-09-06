import { useState, useEffect, useCallback } from 'react';
import { Company, Product, Cart, CartItem, CompanyWithProducts, ClientDashboardState, OrderRequest } from '../types';
import { useAuthOptimized } from '../../../hooks/useAuthOptimized';
import axiosInstance from '../../../config/axios.config';

export const useClientDashboard = () => {
  const { user } = useAuthOptimized();
  
  // State
  const [state, setState] = useState<ClientDashboardState>({
    view: 'companies',
    searchTerm: '',
    categoryFilter: 'all',
    sortBy: 'name'
  });
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithProducts | null>(null);
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalAmount: 0,
    companiesCount: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load companies
  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch companies (users with role 'empresa')
      const response = await axiosInstance.get('/auth/companies');
      setCompanies(response.data || []);
    } catch (err: any) {
      console.error('Error loading companies:', err);
      setError(err.response?.data?.message || 'Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load company with products
  const loadCompanyProfile = useCallback(async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch company details
      const [companyResponse, productsResponse] = await Promise.all([
        axiosInstance.get(`/auth/companies/${companyId}`),
        axiosInstance.get(`/productos/empresa/${companyId}`)
      ]);
      
      const company = companyResponse.data;
      const products = productsResponse.data || [];
      
      const companyWithProducts: CompanyWithProducts = {
        ...company,
        products,
        productsCount: products.length,
        activeProductsCount: products.filter((p: Product) => p.activo).length
      };
      
      setSelectedCompany(companyWithProducts);
      setState(prev => ({ 
        ...prev, 
        view: 'company-profile', 
        selectedCompanyId: companyId 
      }));
    } catch (err: any) {
      console.error('Error loading company profile:', err);
      setError(err.response?.data?.message || 'Error al cargar perfil de empresa');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cart management
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        item => item.product.id === product.id
      );
      
      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = [...prevCart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity
        };
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `${product.id}-${Date.now()}`,
          product,
          quantity,
          companyId: product.empresaId,
          companyName: product.empresa?.name || 'Empresa'
        };
        newItems = [...prevCart.items, newItem];
      }
      
      // Calculate totals
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);
      const companiesCount = new Set(newItems.map(item => item.companyId)).size;
      
      return {
        items: newItems,
        totalItems,
        totalAmount,
        companiesCount
      };
    });
  }, []);

  const updateCartQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);
      const companiesCount = new Set(newItems.map(item => item.companyId)).size;
      
      return {
        items: newItems,
        totalItems,
        totalAmount,
        companiesCount
      };
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.id !== itemId);
      
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);
      const companiesCount = new Set(newItems.map(item => item.companyId)).size;
      
      return {
        items: newItems,
        totalItems,
        totalAmount,
        companiesCount
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      companiesCount: 0
    });
  }, []);

  // Create order
  const createOrder = useCallback(async (companyId: string): Promise<boolean> => {
    if (!user) {
      setError('Debe estar autenticado para realizar pedidos');
      return false;
    }
    
    const companyItems = cart.items.filter(item => item.companyId === companyId);
    
    if (companyItems.length === 0) {
      setError('No hay productos de esta empresa en el carrito');
      return false;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const orderRequest: OrderRequest = {
        empresaId: companyId,
        items: companyItems.map(item => ({
          productoId: item.product.id,
          cantidad: item.quantity,
          precio: item.product.precio
        }))
      };
      
      await axiosInstance.post('/pedidos', orderRequest);
      
      // Remove ordered items from cart
      setCart(prevCart => {
        const remainingItems = prevCart.items.filter(item => item.companyId !== companyId);
        
        const totalItems = remainingItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = remainingItems.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);
        const companiesCount = new Set(remainingItems.map(item => item.companyId)).size;
        
        return {
          items: remainingItems,
          totalItems,
          totalAmount,
          companiesCount
        };
      });
      
      return true;
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Error al crear pedido');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, cart.items]);

  // Navigation
  const navigateToCompanies = useCallback(() => {
    setState(prev => ({ ...prev, view: 'companies', selectedCompanyId: undefined }));
    setSelectedCompany(null);
  }, []);

  const navigateToCart = useCallback(() => {
    setState(prev => ({ ...prev, view: 'cart' }));
  }, []);

  const navigateToMyOrders = useCallback(() => {
    setState(prev => ({ ...prev, view: 'my-orders' }));
  }, []);

  const updateSearch = useCallback((searchTerm: string) => {
    setState(prev => ({ ...prev, searchTerm }));
  }, []);

  const updateCategoryFilter = useCallback((categoryFilter: string) => {
    setState(prev => ({ ...prev, categoryFilter }));
  }, []);

  const updateSortBy = useCallback((sortBy: ClientDashboardState['sortBy']) => {
    setState(prev => ({ ...prev, sortBy }));
  }, []);

  // Filtered and sorted companies
  const filteredCompanies = companies
    .filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                           (company.description || '').toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesCategory = state.categoryFilter === 'all' || company.category === state.categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (state.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        default:
          return 0;
      }
    });

  // Get cart item for product
  const getCartItem = useCallback((productId: string): CartItem | undefined => {
    return cart.items.find(item => item.product.id === productId);
  }, [cart.items]);

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  return {
    // State
    state,
    companies: filteredCompanies,
    selectedCompany,
    cart,
    loading,
    error,
    user,
    
    // Actions
    loadCompanies,
    loadCompanyProfile,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    createOrder,
    navigateToCompanies,
    navigateToCart,
    navigateToMyOrders,
    updateSearch,
    updateCategoryFilter,
    updateSortBy,
    getCartItem
  };
};
