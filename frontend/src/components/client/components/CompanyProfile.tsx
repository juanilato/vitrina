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
        <div className="company-hero">
          <div className="company-avatar-large">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="company-logo-large" />
            ) : (
              <div className="company-logo-placeholder-large">
                {company.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="company-hero-info">
            <div className="company-title-row">
              <h1 className="company-title">{company.name}</h1>
              {company.isVerified && (
                <span className="verified-badge-large" title="Empresa verificada">
                  ✓ Verificada
                </span>
              )}
            </div>
            
            <div className="company-meta-large">
              {company.category && (
                <div className="meta-item">
                  <span className="meta-icon">🏷️</span>
                  <span className="meta-text">{company.category}</span>
                </div>
              )}
              
              <div className="meta-item">
                <span className="meta-icon">📧</span>
                <span className="meta-text">{company.email}</span>
              </div>
              
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span className="meta-text">
                  Desde {new Date(company.createdAt).getFullYear()}
                </span>
              </div>
            </div>

            {company.rating && (
              <div className="company-rating-large">
                <div className="rating-stars-large">
                  {'★'.repeat(Math.floor(company.rating))}
                  {'☆'.repeat(5 - Math.floor(company.rating))}
                </div>
                <span className="rating-value-large">
                  {company.rating.toFixed(1)}
                </span>
                {company.reviewCount && (
                  <span className="review-count-large">
                    ({company.reviewCount} reseñas)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {company.description && (
          <div className="company-description-large">
            <p>{company.description}</p>
          </div>
        )}

        {/* Company Stats */}
        <div className="company-stats-large">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <span className="stat-number">{company.productsCount}</span>
              <span className="stat-label">
                {company.productsCount === 1 ? 'Producto' : 'Productos'}
              </span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <span className="stat-number">{company.activeProductsCount}</span>
              <span className="stat-label">Disponibles</span>
            </div>
          </div>
          
          {company.products.length > 0 && (
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <span className="stat-number">
                  {formatPrice(
                    company.products
                      .filter(p => p.activo)
                      .reduce((min, p) => Math.min(min, p.precio), Infinity)
                  )}
                </span>
                <span className="stat-label">Desde</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="company-products-section">
        <div className="products-header">
          <h2 className="products-title">
            <span className="title-icon">🛍️</span>
            Productos
          </h2>
          
          <div className="products-controls">
            {/* Product Search */}
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

            {/* Product Filter */}
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

        {/* Products Grid */}
        <div className="products-content">
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
            <div className="products-grid">
              {filteredProducts.map((product) => {
                const cartItem = getCartItem(product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    isInCart={!!cartItem}
                    cartQuantity={cartItem?.quantity || 0}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
