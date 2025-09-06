import React, { useState } from 'react';
import { Product, CartItem } from '../types';

interface CompanyStoreProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  cartItem?: CartItem;
}

const CompanyStoreProductCard: React.FC<CompanyStoreProductCardProps> = ({
  product,
  onAddToCart,
  cartItem
}) => {
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  const incrementQuantity = () => {
    if (quantity < 99) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="product-card">
      {/* Product Image */}
      <div className="product-image">
        {product.fotoUrl ? (
          <img src={product.fotoUrl} alt={product.nombre} />
        ) : (
          <div className="product-placeholder">
            <span className="placeholder-icon">📦</span>
          </div>
        )}
      </div>
      
      {/* Product Content */}
      <div className="product-content">
        <div className="product-header">
          <h3 className="product-name">{product.nombre}</h3>
        </div>
        
        {product.descripcion && (
          <p className="product-description">
            {product.descripcion.length > 120 
              ? `${product.descripcion.substring(0, 120)}...`
              : product.descripcion
            }
          </p>
        )}
        
        <div className="product-details">
          <div className="product-price">
            <span className="price-label">Precio:</span>
            <span className="price-value">{formatPrice(product.precio)}</span>
          </div>
        </div>
      </div>
      
      {/* Product Actions */}
      <div className="product-actions">
        {cartItem ? (
          <div className="cart-info">
            <span className="btn-icon">✅</span>
            En carrito: {cartItem.quantity} {cartItem.quantity === 1 ? 'unidad' : 'unidades'}
          </div>
        ) : (
          <>
            <div className="quantity-controls">
              <button 
                className="quantity-btn"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity-display">{quantity}</span>
              <button 
                className="quantity-btn"
                onClick={incrementQuantity}
                disabled={quantity >= 99}
              >
                +
              </button>
            </div>
            <button 
              className="btn-add-to-cart"
              onClick={handleAddToCart}
            >
              <span className="btn-icon">🛒</span>
              Agregar al Carrito
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyStoreProductCard;
