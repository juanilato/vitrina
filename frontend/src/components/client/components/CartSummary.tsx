import React, { useState } from 'react';
import { CartSummaryProps } from '../types';

const CartSummary: React.FC<CartSummaryProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const handleCheckout = async (companyId: string) => {
    if (processingOrders.has(companyId)) return;
    
    setProcessingOrders(prev => new Set(prev).add(companyId));
    try {
      await onCheckout(companyId);
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(companyId);
        return newSet;
      });
    }
  };

  // Group items by company
  const itemsByCompany = cart.items.reduce((acc, item) => {
    const companyId = item.companyId;
    if (!acc[companyId]) {
      acc[companyId] = {
        companyName: item.companyName,
        items: [],
        total: 0
      };
    }
    acc[companyId].items.push(item);
    acc[companyId].total += item.product.precio * item.quantity;
    return acc;
  }, {} as Record<string, { companyName: string; items: typeof cart.items; total: number }>);

  if (cart.items.length === 0) {
    return (
      <div className="cart-summary empty">
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h3 className="empty-title">Tu carrito está vacío</h3>
          <p className="empty-description">
            Explora nuestras empresas y agrega productos a tu carrito
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-summary">
      {/* Cart Header */}
      <div className="cart-header">
        <h2 className="cart-title">
          <span className="cart-icon">🛒</span>
          Tu Carrito
        </h2>
        <div className="cart-stats">
          <span className="cart-items-count">
            {cart.totalItems} {cart.totalItems === 1 ? 'producto' : 'productos'}
          </span>
          <span className="cart-companies-count">
            de {cart.companiesCount} {cart.companiesCount === 1 ? 'empresa' : 'empresas'}
          </span>
        </div>
      </div>

      {/* Cart Content */}
      <div className="cart-content">
        {Object.entries(itemsByCompany).map(([companyId, companyData]) => (
          <div key={companyId} className="company-section">
            {/* Company Header */}
            <div className="company-section-header">
              <h3 className="company-section-title">
                <span className="company-icon">🏢</span>
                {companyData.companyName}
              </h3>
              <div className="company-section-total">
                {formatPrice(companyData.total)}
              </div>
            </div>

            {/* Company Items */}
            <div className="company-items">
              {companyData.items.map((item) => (
                <div key={item.id} className="cart-item">
                  {/* Item Image */}
                  <div className="item-image-container">
                    {item.product.fotoUrl ? (
                      <img 
                        src={item.product.fotoUrl} 
                        alt={item.product.nombre}
                        className="item-image"
                      />
                    ) : (
                      <div className="item-image-placeholder">
                        <span className="placeholder-icon">📦</span>
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="item-info">
                    <h4 className="item-name">{item.product.nombre}</h4>
                    {item.product.descripcion && (
                      <p className="item-description">
                        {item.product.descripcion.length > 100 
                          ? `${item.product.descripcion.substring(0, 100)}...`
                          : item.product.descripcion
                        }
                      </p>
                    )}
                    <div className="item-price">
                      {formatPrice(item.product.precio)} c/u
                    </div>
                  </div>

                  {/* Item Controls */}
                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= 99}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="item-total">
                      {formatPrice(item.product.precio * item.quantity)}
                    </div>
                    
                    <button 
                      className="remove-btn"
                      onClick={() => onRemoveItem(item.id)}
                      title="Eliminar del carrito"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Company Checkout */}
            <div className="company-checkout">
              <button 
                className={`checkout-btn ${processingOrders.has(companyId) ? 'loading' : ''}`}
                onClick={() => handleCheckout(companyId)}
                disabled={processingOrders.has(companyId)}
              >
                {processingOrders.has(companyId) ? (
                  <>
                    <span className="btn-spinner"></span>
                    Procesando pedido...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">📋</span>
                    Hacer pedido a {companyData.companyName}
                    <span className="checkout-total">
                      {formatPrice(companyData.total)}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Footer */}
      <div className="cart-footer">
        <div className="cart-total">
          <div className="total-label">Total General:</div>
          <div className="total-amount">{formatPrice(cart.totalAmount)}</div>
        </div>
        <div className="cart-note">
          <span className="note-icon">ℹ️</span>
          <span className="note-text">
            Los pedidos se realizan por empresa individualmente
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
