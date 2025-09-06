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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductModal = () => {
    setSelectedProduct(null);
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
    <div className="company-store-page-clean">

      {/* Company Header */}
      <div className="company-header-section">
        <button className="back-btn-clean" onClick={() => navigate('/dashboard')}>
          ← Volver
        </button>

        {/* Company Info Card */}
        <div className="company-info-card">
          <div className="company-logo-section">
            <div className="company-logo-clean">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="company-logo-img-clean" />
              ) : (
                <div className="company-logo-placeholder-clean">
                  {company.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="company-info-text-clean">
              <h1 className="company-name-clean">{company.name}</h1>
              <div className="status-badge-clean">
                <span className="status-dot-clean"></span>
                Abierto
              </div>
            </div>
          </div>
          
          <div className="company-description-clean">
            <p>{company.description || ''}</p>
          </div>

          {/* Delivery Options */}
          <div className="delivery-options-clean">
            <button className="delivery-btn-clean active">
              <span className="delivery-icon">🚚</span>
              Delivery
            </button>
            <button className="delivery-btn-clean">
              <span className="delivery-icon">🏪</span>
              Retirar
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="products-section-clean">

        <div className="products-grid-clean">
          {company.products.filter(p => p.activo).length === 0 ? (
            <div className="no-products-clean">
              <div className="empty-icon">📦</div>
              <h3 className="empty-title">No hay productos disponibles</h3>
              <p className="empty-description">Esta empresa aún no ha publicado productos activos.</p>
            </div>
          ) : (
            <>
              {company.products
                .filter(product => product.activo)
                .map((product) => {
                  const cartItem = getCartItem(product.id);
                  return (
                    <CompanyStoreProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      onProductClick={handleProductClick}
                      cartItem={cartItem}
                    />
                  );
                })
              }
            </>
          )}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.totalItems > 0 && (
        <button className="floating-cart-btn-clean" onClick={() => setView('cart')}>
          <span className="cart-icon">🛒</span>
          <span className="cart-text">Tu pedido</span>
          <span className="cart-total">{cart.totalItems}</span>
        </button>
      )}

      {/* Cart Modal - Fullscreen */}
      {view === 'cart' && (
        <div className="cart-modal-overlay-fullscreen">
          <div className="cart-modal-fullscreen">
            {/* Header */}
            <div className="cart-modal-header-fullscreen">
              <h3 className="cart-modal-title-fullscreen">Pedido de delivery</h3>
              <button className="close-cart-btn-fullscreen" onClick={() => setView('products')}>
                ✕
              </button>
            </div>
            
            {/* Delivery Options */}
            <div className="cart-delivery-options">
              <button className="cart-delivery-btn active">
                Delivery
              </button>
              <button className="cart-delivery-btn">
                Retirar
              </button>
            </div>

            {/* Cart Content */}
            <div className="cart-modal-content-fullscreen">
              <CartSummary
                cart={cart}
                onUpdateQuantity={updateCartQuantity}
                onRemoveItem={removeFromCart}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="product-modal-overlay">
          <div className="product-modal">
            <div className="product-modal-header">
              <h3 className="product-modal-title">Detalles del Producto</h3>
              <button className="close-product-btn" onClick={handleCloseProductModal}>
                ✕
              </button>
            </div>
            <div className="product-modal-content">
              <div className="product-image-large">
                {selectedProduct.fotoUrl ? (
                  <img 
                    src={selectedProduct.fotoUrl} 
                    alt={selectedProduct.nombre}
                    className="product-large-image"
                  />
                ) : (
                  <div className="product-image-placeholder-large">
                    <span className="placeholder-icon-large">📦</span>
                  </div>
                )}
              </div>
              
              <div className="product-details-large">
                <h2 className="product-name-large">{selectedProduct.nombre}</h2>
                {selectedProduct.descripcion && (
                  <p className="product-description-large">{selectedProduct.descripcion}</p>
                )}
                <div className="product-price-large">
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS'
                  }).format(selectedProduct.precio)}
                </div>
                
                <div className="product-actions-large">
                  {getCartItem(selectedProduct.id) ? (
                    <div className="cart-info-large">
                      <span className="cart-icon-large">✅</span>
                      <span>En carrito: {getCartItem(selectedProduct.id)?.quantity} unidad{getCartItem(selectedProduct.id)?.quantity !== 1 ? 'es' : ''}</span>
                    </div>
                  ) : (
                    <button 
                      className="add-to-cart-btn-large"
                      onClick={() => {
                        addToCart(selectedProduct, 1);
                        handleCloseProductModal();
                      }}
                    >
                      <span className="cart-icon-large">🛒</span>
                      Agregar al Carrito
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyStorePage;
