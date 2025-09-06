import React from 'react';
import { Product, CartItem } from '../types';

interface CompanyStoreProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onProductClick: (product: Product) => void;
  cartItem?: CartItem;
}

const CompanyStoreProductCard: React.FC<CompanyStoreProductCardProps> = ({
  product,
  onAddToCart,
  onProductClick,
  cartItem
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const handleCardClick = () => {
    onProductClick(product);
  };

  return (
    <div 
      className={`product-card-horizontal ${cartItem ? 'in-cart' : 'clickable'}`}
      onClick={handleCardClick}
    >
      <div className="product-info-left">
        <h3 className="product-name-horizontal">{product.nombre}</h3>
        {product.descripcion && (
          <p className="product-description-horizontal">{product.descripcion}</p>
        )}
        <div className="product-price-horizontal">{formatPrice(product.precio)}</div>
      </div>
      
      <div className="product-image-container-horizontal">
        {product.fotoUrl ? (
          <img 
            src={product.fotoUrl} 
            alt={product.nombre}
            className="product-image-horizontal"
          />
        ) : (
          <div className="product-image-placeholder-horizontal">
            <span className="placeholder-icon-horizontal">📦</span>
          </div>
        )}
        {cartItem && (
          <div className="cart-indicator-horizontal">
            {cartItem.quantity}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyStoreProductCard;
