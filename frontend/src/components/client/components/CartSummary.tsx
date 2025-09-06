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
            Explora y agrega productos a tu carrito
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-summary-fullscreen">
      {/* Product Summary Card */}
      <div className="product-summary-card">
        <div className="product-summary-header">
          <div className="product-summary-title">
            <span className="product-icon">🍽️</span>
            <span className="product-count">{cart.totalItems} Producto{cart.totalItems !== 1 ? 's' : ''}</span>
          </div>
          <button className="schedule-btn">Programar</button>
        </div>
        
        {/* Product List Header */}
        <div className="product-list-header">
          <span className="header-item">Item</span>
          <span className="header-qty">Cant.</span>
          <span className="header-price">Precio</span>
        </div>

        {/* Products List */}
        <div className="products-list-compact">
          {cart.items.map((item) => (
            <div key={item.id} className="product-item-compact">
              <div className="product-info-compact">
                <div className="product-image-compact">
                  {item.product.fotoUrl ? (
                    <img 
                      src={item.product.fotoUrl} 
                      alt={item.product.nombre}
                      className="product-img-compact"
                    />
                  ) : (
                    <div className="product-placeholder-compact">📦</div>
                  )}
                </div>
                <span className="product-name-compact">{item.product.nombre}</span>
              </div>
              
              <div className="quantity-controls-compact">
                <button 
                  className="qty-btn-compact"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="qty-display-compact">{item.quantity} u</span>
                <button 
                  className="qty-btn-compact"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= 99}
                >
                  +
                </button>
              </div>
              
              <div className="product-price-compact">
                {formatPrice(item.product.precio)}
              </div>
            </div>
          ))}
        </div>

        {/* Subtotal */}
        <div className="subtotal-section">
          <span className="subtotal-label">Subtotal</span>
          <span className="subtotal-amount">{formatPrice(cart.totalAmount)}</span>
        </div>
      </div>

      {/* User Data Card */}
      <div className="user-data-card">
        <div className="user-data-header">
          <span className="user-icon">👤</span>
          <span className="user-data-title">Tus datos</span>
        </div>
        
        <div className="user-data-form">
          <input 
            type="text" 
            placeholder="Nombre y apellido*" 
            className="user-input-full"
          />
          
          <div className="user-input-row">
            <select className="user-select">
              <option value="+54">+54</option>
            </select>
            <input 
              type="tel" 
              placeholder="Teléfono *" 
              className="user-input-half"
            />
          </div>
          
          <input 
            type="email" 
            placeholder="Email (opcional)" 
            className="user-input-full"
          />
        </div>
      </div>

      {/* Delivery Address Card */}
      <div className="delivery-address-card">
        <div className="delivery-address-header">
          <span className="delivery-icon">🏠</span>
          <span className="delivery-address-title">Dirección de entrega</span>
        </div>
        
        <div className="delivery-address-form">
          <input 
            type="text" 
            placeholder="Dirección completa*" 
            className="user-input-full"
          />
          
          <div className="user-input-row">
            <input 
              type="text" 
              placeholder="Piso/Depto (opcional)" 
              className="user-input-half"
            />
            <input 
              type="text" 
              placeholder="Referencias" 
              className="user-input-half"
            />
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="checkout-section">
        <button 
          className="checkout-btn-fullscreen"
          onClick={() => handleCheckout(cart.items[0]?.companyId || '')}
          disabled={processingOrders.has(cart.items[0]?.companyId || '')}
        >
          {processingOrders.has(cart.items[0]?.companyId || '') ? (
            <>
              <span className="btn-spinner"></span>
              Procesando pedido...
            </>
          ) : (
            <>
              Realizar Pedido
              <span className="checkout-total-fullscreen">
                {formatPrice(cart.totalAmount)}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CartSummary;
