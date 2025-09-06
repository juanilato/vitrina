import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthOptimized } from '../../../hooks/useAuthOptimized';
import NavigationHeader from '../../layout/NavigationHeader';
import CompanyStoreProductCard from './CompanyStoreProductCard';
import CartSummary from '../components/CartSummary';
import { Company, Product, Cart, CartItem } from '../types';
import axiosInstance from '../../../config/axios.config';
import { findCompanyByUrlSlug } from '../../../utils/urlHelpers';
import '../ClientDashboard.css';
import './CompanyStorePage.css';

interface CompanyWithProducts extends Company {
  products: Product[];
  productsCount: number;
  activeProductsCount: number;
}

const CompanyStorePage: React.FC = () => {
  const { companyName } = useParams<{ companyName: string }>();
  const navigate = useNavigate();
  const { user } = useAuthOptimized();

  // State
  const [company, setCompany] = useState<CompanyWithProducts | null>(null);
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalAmount: 0,
    companiesCount: 1 // Always 1 for company-specific cart
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'products' | 'cart'>('products');

  // Load company data and products
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!companyName) return;
      
      try {
        setLoading(true);
        setError(null);

        // First, get all companies and find the one with matching name
        const companiesResponse = await axiosInstance.get('/auth/companies');
        const companies = companiesResponse.data || [];
        
        // Find company by URL slug
        const targetCompany = findCompanyByUrlSlug(companies, companyName);

        if (!targetCompany) {
          throw new Error('Empresa no encontrada');
        }

        // Now get company details and products using the ID
        const [companyResponse, productsResponse] = await Promise.all([
          axiosInstance.get(`/auth/companies/${targetCompany.id}`),
          axiosInstance.get(`/productos/empresa/${targetCompany.id}`)
        ]);

        const companyData = companyResponse.data;
        const products = productsResponse.data || [];

        const companyWithProducts: CompanyWithProducts = {
          ...companyData,
          products,
          productsCount: products.length,
          activeProductsCount: products.filter((p: Product) => p.activo).length
        };

        setCompany(companyWithProducts);
      } catch (err: any) {
        console.error('Error loading company data:', err);
        setError(err.response?.data?.message || err.message || 'Error al cargar la empresa');
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [companyName]);

  // Cart management
  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      // Check if item already exists
      const existingItemIndex = prevCart.items.findIndex(item => item.product.id === product.id);
      
      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = prevCart.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `${product.id}-${Date.now()}`,
          product,
          quantity,
          companyId: company?.id || '',
          companyName: company?.name || ''
        };
        newItems = [...prevCart.items, newItem];
      }

      // Recalculate totals
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);

      return {
        items: newItems,
        totalItems,
        totalAmount,
        companiesCount: 1
      };
    });
  };

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);

      return {
        items: newItems,
        totalItems,
        totalAmount,
        companiesCount: 1
      };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.id !== itemId);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);

      return {
        items: newItems,
        totalItems,
        totalAmount,
        companiesCount: newItems.length > 0 ? 1 : 0
      };
    });
  };

  const createOrder = async (): Promise<boolean> => {
    if (!user || cart.items.length === 0) return false;

    try {
      setLoading(true);
      setError(null);

      const orderRequest = {
        empresaId: company?.id,
        items: cart.items.map(item => ({
          productoId: item.product.id,
          cantidad: item.quantity,
          precio: Number(item.product.precio)
        }))
      };

      await axiosInstance.post('/pedidos', orderRequest);

      // Clear cart after successful order
      setCart({
        items: [],
        totalItems: 0,
        totalAmount: 0,
        companiesCount: 0
      });

      return true;
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Error al crear pedido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (): Promise<void> => {
    const success = await createOrder();
    if (success) {
      alert('¡Pedido creado exitosamente! La empresa será notificada.');
      setView('products'); // Return to products view
    }
  };

  const getCartItem = (productId: string) => {
    return cart.items.find(item => item.product.id === productId);
  };

  // Early returns
  if (!user) {
    return (
      <div className="company-store-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="company-store-page">

        <div className="company-store-loading">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando tienda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="company-store-page">
   
        <div className="company-store-error">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error || 'Empresa no encontrada'}</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="company-store-page">

      
      {/* Company Store Header */}
      <header className="company-store-header">
        <div className="store-header-content">
          {/* Back Button */}
          <button 
            className="back-btn"
            onClick={() => navigate('/dashboard')}
          >
            <span className="back-icon">←</span>
            Volver al Dashboard
          </button>

          {/* Company Info */}
          <div className="company-store-info">
            <div className="company-avatar">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="company-logo" />
              ) : (
                <div className="company-logo-placeholder">
                  {company.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="company-details">
              <h1 className="company-name">{company.name}</h1>
              {company.description && (
                <p className="company-description">{company.description}</p>
              )}
     
            </div>
          </div>

          {/* View Toggle & Cart Button */}
          <div className="store-header-actions">
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${view === 'products' ? 'active' : ''}`}
                onClick={() => setView('products')}
              >
                <span className="btn-icon">🛍️</span>
                Productos
              </button>
              <button 
                className={`toggle-btn ${view === 'cart' ? 'active' : ''}`}
                onClick={() => setView('cart')}
              >
                <span className="btn-icon">🛒</span>
                Carrito
                {cart.totalItems > 0 && (
                  <span className="cart-badge">{cart.totalItems}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="company-store-main">
        {view === 'products' ? (
          <div className="products-section">
            {company.products.filter(p => p.activo).length === 0 ? (
              <div className="no-products">
                <div className="empty-icon">📦</div>
                <h3>No hay productos disponibles</h3>
                <p>Esta empresa aún no ha publicado productos activos.</p>
              </div>
            ) : (
              <div className="products-grid">
                {company.products
                  .filter(product => product.activo)
                  .map((product) => {
                    const cartItem = getCartItem(product.id);
                    return (
                      <CompanyStoreProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={addToCart}
                        cartItem={cartItem}
                      />
                    );
                  })
                }
              </div>
            )}
          </div>
        ) : (
          <div className="cart-section">
            <CartSummary
              cart={cart}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyStorePage;
