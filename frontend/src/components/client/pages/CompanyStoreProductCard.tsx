import React, { useState, useCallback } from 'react';
import { Product, CartItem } from '../types';
import './CompanyStoreProductMobile.css';

interface Props {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  cartItem?: CartItem;
}

const CompanyStoreProductCard: React.FC<Props> = ({
  product,
  onAddToCart,
  cartItem
}) => {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen(v => !v), []);
  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);

  return (
    <div
      className={`product-card ${open ? 'open' : ''}`}
      onClick={toggle}
      role="button"
      tabIndex={0}
    >
      {product.fotoUrl ? (
        <img src={product.fotoUrl} alt={product.nombre} className="product-img" />
      ) : (
        <div className="product-placeholder">📦</div>
      )}

      {/* Precio siempre visible */}
      <div className="product-price">{fmt(product.precio)}</div>

      {/* Panel oculto que sube solo cuando se hace click */}
      <div className="product-overlay">
        <h3 className="product-name">{product.nombre}</h3>
        {product.descripcion && <p className="product-desc">{product.descripcion}</p>}

        <button
          className="product-add-btn"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product, 1);
            setOpen(false);
          }}
        >
          🛒 Añadir al carrito
        </button>
      </div>

      {/* Indicador si ya está en carrito */}
      {cartItem && <div className="cart-badge">{cartItem.quantity}</div>}
    </div>
  );
};

export default CompanyStoreProductCard;