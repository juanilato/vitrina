import React, { useState } from 'react';
import { CompanyWithProducts } from '../types';
import ProductCard from './ProductCard';

interface CompanyProfileProps {
  company: CompanyWithProducts;
  loading: boolean;
  onAddToCart: (product: any, quantity: number) => void;
  onBackToCompanies: () => void;
  getCartItem: (productId: string) => any;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({
  company,
  loading,
  onAddToCart,
  onBackToCompanies,
  getCartItem
}) => {
  const [productFilter, setProductFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [productSearch, setProductSearch] = useState('');

  if (loading) {
    return (
      <div className="company-profile loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando perfil de empresa...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="company-profile error">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3 className="error-title">Empresa no encontrada</h3>
          <p className="error-description">
            La empresa que buscas no existe o no está disponible
          </p>
          <button className="btn btn-primary" onClick={onBackToCompanies}>
            <span className="btn-icon">🏢</span>
            Volver a empresas
          </button>
        </div>
      </div>
    );
  }

  // Filter products
  const filteredProducts = company.products
    .filter(product => {
      const matchesFilter = 
        productFilter === 'all' || 
        (productFilter === 'active' && product.activo) ||
        (productFilter === 'inactive' && !product.activo);
      
      const matchesSearch = 
        product.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
        (product.descripcion || '').toLowerCase().includes(productSearch.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  return (
    <div className="company-profile">
      {/* Navigation */}
      <div className="profile-navigation">
        <button className="back-btn" onClick={onBackToCompanies}>
          <span className="back-icon">←</span>
          Volver a empresas
        </button>
      </div>

      {/* Company Header */}
      <div className="company-profile-header">
        {/* Hero Image */}
        {company.products.length > 0 && (
          <div className="company-hero-image">
            <img 
              src={company.products[0].fotoUrl || '/default-product.jpg'} 
              alt={company.products[0].nombre}
              className="hero-product-image"
            />
            <div className="hero-overlay"></div>
          </div>
        )}

        {/* Company Info Section */}
        <div className="company-info-section">
          <div className="company-logo-name">
            <div className="company-logo-circular">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="company-logo-img" />
              ) : (
                <div className="company-logo-placeholder">
                  {company.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="company-name-status">
              <h1 className="company-name">{company.name}</h1>
              <div className="status-badge open">
                <span className="status-dot"></span>
                Abierto
              </div>
            </div>
          </div>

          {/* Business Description */}
          <div className="business-description">
            <p>
              {company.description || `${company.category || 'Negocio'} - ${company.activeProductsCount} productos disponibles`}
            </p>
          </div>

          {/* Delivery Options */}
          <div className="delivery-options">
            <button className="delivery-btn active">
              <span className="delivery-icon">🚚</span>
              Delivery
            </button>
            <button className="delivery-btn">
              <span className="delivery-icon">🏪</span>
              Retirar
            </button>
          </div>

          {/* Order Timing */}
          <div className="order-timing">
            <div className="timing-label">Recibir pedido</div>
            <div className="timing-options">
              <button className="timing-btn active">
                <span className="timing-check">✓</span>
                Lo más pronto
              </button>
              <button className="timing-btn">
                Programar entrega
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="company-products-section">
        {/* Category Header */}
        <div className="category-header">
          <h2 className="category-title">
            {company.category?.toUpperCase() || 'PRODUCTOS'}
          </h2>
        </div>

        {/* Products List */}
        <div className="products-list">
          {filteredProducts.length === 0 ? (
            <div className="products-empty">
              <div className="empty-icon">📦</div>
              <h3 className="empty-title">No se encontraron productos</h3>
              <p className="empty-description">
                {productSearch || productFilter !== 'active'
                  ? 'Intenta ajustar tus filtros de búsqueda'
                  : 'Esta empresa aún no tiene productos disponibles'
                }
              </p>
              {(productSearch || productFilter !== 'active') && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setProductSearch('');
                    setProductFilter('active');
                  }}
                >
                  <span className="btn-icon">🔄</span>
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="products-menu">
              {filteredProducts.map((product) => {
                const cartItem = getCartItem(product.id);
                return (
                  <div key={product.id} className="product-menu-item">
                    <div className="product-info">
                      <h3 className="product-name">{product.nombre}</h3>
                      <p className="product-description">
                        {product.descripcion || 'Delicioso producto disponible'}
                      </p>
                      <div className="product-price">
                        {formatPrice(product.precio)}
                      </div>
                    </div>
                    
                    <div className="product-image-container">
                      <img 
                        src={product.fotoUrl || '/default-product.jpg'} 
                        alt={product.nombre}
                        className="product-menu-image"
                      />
                      {cartItem && (
                        <div className="cart-indicator">
                          {cartItem.quantity}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hidden controls for filtering */}
        <div className="products-controls-hidden">
          <div className="product-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="search-input"
            />
            {productSearch && (
              <button 
                className="clear-search-btn"
                onClick={() => setProductSearch('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="product-filter">
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value as any)}
              className="filter-select"
            >
              <option value="active">✅ Solo disponibles</option>
              <option value="all">📦 Todos los productos</option>
              <option value="inactive">❌ No disponibles</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
