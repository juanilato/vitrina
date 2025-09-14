import React from 'react';
import { useClientDashboard } from './hooks/useClientDashboard';
import { CompanyExplorer, CompanyProfile, CartSummary, MyOrders } from './components';
import NotificationsDropdown from '../common/NotificationsDropdown';
import './ClientDashboard.css';

const ClientDashboard: React.FC = () => {
  const {
    state,
    companies,
    selectedCompany,
    cart,
    loading,
    error,
    user,
    loadCompanyProfile,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    createOrder,
    navigateToCompanies,
    navigateToCart,
    navigateToMyOrders,
    updateSearch,
    updateCategoryFilter,
    updateSortBy,
    getCartItem
  } = useClientDashboard();

  const handleAddToCart = async (product: any, quantity: number) => {
    addToCart(product, quantity);
  };

  const handleCheckout = async (companyId: string): Promise<void> => {
    const success = await createOrder(companyId);
    if (success) {
      alert('¡Pedido creado exitosamente! La empresa será notificada.');
    }
  };

  // Early return if user is not loaded
  if (!user) {
    return (
      <div className="client-dashboard-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando su dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-dashboard">
      {/* Header */}
      <header className="client-header">
        <div className="header-container">
          {/* Logo and Brand */}
          <div className="header-brand">
            <img 
              src="/vitrina-logo.png" 
              alt="VITRINA" 
              className="header-logo"
            />
            <span className="brand-title">Vitrina</span>
          </div>

          {/* User Section */}
          <div className="header-user">
          <div className="notifications-container">
              <NotificationsDropdown />
            </div>
            <div className="user-info-card">
     
              <span className="user-name">{user.name}</span>
            </div>
            
            {/* Notificaciones */}
    
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="main-navbar">
        <div className="navbar-container">
          <button 
            className={`navbar-btn ${state.view === 'companies' || state.view === 'company-profile' ? 'active' : ''}`}
            onClick={navigateToCompanies}
          >
            <span className="navbar-icon">🔍</span>
            <span className="navbar-label">EXPLORAR</span>
          </button>
          
          <button 
            className={`navbar-btn ${state.view === 'my-orders' ? 'active' : ''}`}
            onClick={navigateToMyOrders}
          >
            <span className="navbar-icon">📋</span>
            <span className="navbar-label">MIS PEDIDOS</span>
          </button>
          

        </div>
      </nav>

      {/* Main Content */}
      <main className="client-main">
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button 
              className="error-close"
              onClick={() => window.location.reload()}
            >
              ✕
            </button>
          </div>
        )}

        <div className="main-container">
          {state.view === 'companies' && (
            <CompanyExplorer
              companies={companies}
              state={state}
              loading={loading}
              onViewCompany={loadCompanyProfile}
              onUpdateSearch={updateSearch}
              onUpdateCategoryFilter={updateCategoryFilter}
              onUpdateSortBy={updateSortBy}
            />
          )}

          {state.view === 'company-profile' && (
            <CompanyProfile
              company={selectedCompany!}
              loading={loading}
              onAddToCart={handleAddToCart}
              onBackToCompanies={navigateToCompanies}
              getCartItem={getCartItem}
            />
          )}

          {state.view === 'cart' && (
            <CartSummary
              cart={cart}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}
            />
          )}

          {state.view === 'my-orders' && (
            <MyOrders />
          )}
        </div>
      </main>

      {/* Floating Cart Button (when not in cart view) */}
      {state.view !== 'cart' && cart.totalItems > 0 && (
        <button 
          className="floating-cart-btn"
          onClick={navigateToCart}
          title="Ver carrito"
        >
          <span className="cart-icon">🛒</span>
          <span className="cart-count">{cart.totalItems}</span>
          <span className="cart-total">
            {new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS'
            }).format(cart.totalAmount)}
          </span>
        </button>
      )}
    </div>
  );
};

export default ClientDashboard;
