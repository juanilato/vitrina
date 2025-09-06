import React, { useState } from 'react';
import { ProductCardProps } from '../types';

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  isInCart = false,
  cartQuantity = 0
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (isAdding) return;
    
    setIsAdding(true);
    try {
      await onAddToCart(product, quantity);
      // Reset quantity after adding
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  return (
    <div className={`client-product-card ${!product.activo ? 'inactive' : ''}`}>
      {/* Product Image */}
      <div className="product-image-container">
        {product.fotoUrl ? (
          <img 
            src={product.fotoUrl} 
            alt={product.nombre}
            className="product-image"
            loading="lazy"
          />
        ) : (
          <div className="product-image-placeholder">
            <span className="placeholder-icon">📦</span>
            <span className="placeholder-text">Sin imagen</span>
          </div>
        )}
        
        {!product.activo && (
          <div className="product-overlay">
            <span className="overlay-text">No disponible</span>
          </div>
        )}
        
        {isInCart && (
          <div className="cart-indicator">
            <span className="cart-badge">{cartQuantity}</span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="product-content">
        <div className="product-header">
          <h3 className="product-name">{product.nombre}</h3>
          <div className="product-price">
            {formatPrice(product.precio)}
          </div>
        </div>

        {product.descripcion && (
          <p className="product-description">
            {product.descripcion}
          </p>
        )}


      </div>

      {/* Product Actions */}
      <div className="product-actions">
        {product.activo ? (
          <>
            <div className="quantity-controls">
              <button 
                className="quantity-btn"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity-display">{quantity}</span>
              <button 
                className="quantity-btn"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 99}
              >
                +
              </button>
            </div>
            
            <button 
              className={`add-to-cart-btn ${isAdding ? 'loading' : ''}`}
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <>
                  <span className="btn-spinner"></span>
                  Agregando...
                </>
              ) : (
                <>
                  <span className="btn-icon">🛒</span>
                  {isInCart ? 'Agregar más' : 'Agregar al carrito'}
                </>
              )}
            </button>
          </>
        ) : (
          <div className="product-unavailable">
            <span className="unavailable-icon">❌</span>
            <span className="unavailable-text">No disponible</span>
          </div>
        )}
      </div>

      {/* Product Meta */}
      <div className="product-meta">
        <div className="meta-item">
          <span className="meta-icon">📅</span>
          <span className="meta-text">
            Agregado {new Date(product.createdAt).toLocaleDateString()}
          </span>
        </div>
        {product.updatedAt !== product.createdAt && (
          <div className="meta-item">
            <span className="meta-icon">🔄</span>
            <span className="meta-text">
              Actualizado {new Date(product.updatedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
