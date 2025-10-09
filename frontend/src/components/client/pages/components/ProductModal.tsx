


// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/company/site/components/ProductModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import { Product, CartItem } from '../../types';

export const ProductModal: React.FC<{
  product: Product;
  getCartItem: (id: string) => CartItem | undefined;
  onAddToCart: (p: Product) => void;
  onClose: () => void;
}> = ({ product, getCartItem, onAddToCart, onClose }) => {
  const cartItem = getCartItem(product.id);
  return (
    <div className="product-modal-overlay">
      <div className="product-modal">
        <div className="product-modal-header">
          <h3 className="product-modal-title">Detalles del Producto</h3>
          <button className="close-product-btn" onClick={onClose}>✕</button>
        </div>
        <div className="product-modal-content">
          <div className="product-image-large">
            {product.fotoUrl ? (
              <img src={product.fotoUrl} alt={product.nombre} className="product-large-image" />
            ) : (
              <div className="product-image-placeholder-large"><span className="placeholder-icon-large">📦</span></div>
            )}
          </div>
          <div className="product-details-large">
            <h2 className="product-name-large">{product.nombre}</h2>
            {product.descripcion && <p className="product-description-large">{product.descripcion}</p>}
            <div className="product-price-large">
              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.precio)}
            </div>
            <div className="product-actions-large">
              {cartItem ? (
                <div className="cart-info-large">
                  <span className="cart-icon-large">✅</span>
                  <span>
                    En carrito: {cartItem.quantity} unidad{cartItem.quantity !== 1 ? 'es' : ''}
                  </span>
                </div>
              ) : (
                <button className="add-to-cart-btn-large" onClick={() => onAddToCart(product)}>
                  <span className="cart-icon-large">🛒</span>
                  Agregar al Carrito
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
