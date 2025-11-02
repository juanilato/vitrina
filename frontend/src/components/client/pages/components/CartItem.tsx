/**
 * Cart Item Component (Web)
 * Muestra un producto en el carrito con opciones para editar cantidad y notas
 * Migrado desde mobile para mantener consistencia
 */

import React, { useState } from 'react';
import { CartItem as CartItemType } from '../../types';
import './CartItem.css';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onUpdateNotes?: (notes: string) => void;
  onRemove: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onUpdateNotes,
  onRemove,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const handleDecrease = () => {
    if (item.quantity === 1) {
      if (window.confirm(`¿Deseas eliminar ${item.product.nombre} del carrito?`)) {
        onRemove();
      }
    } else {
      onUpdateQuantity(item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onUpdateQuantity(item.quantity + 1);
  };

  const handleNotesBlur = () => {
    if (onUpdateNotes && notes.trim() !== '') {
      onUpdateNotes(notes.trim());
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const priceRaw = item.product.precio || 0;
  const price = typeof priceRaw === 'string' ? parseFloat(priceRaw) : priceRaw;
  const pricePerUnit = price;
  const itemTotal = pricePerUnit * item.quantity;
  const productName = item.product.nombre || 'Producto';
  const productDescription = item.product.descripcion;
  const productImage = item.product.fotoUrl;

  return (
    <div className="cart-item-container">
      {/* Product Info */}
      <div className="cart-item-content">
        {productImage && (
          <img
            src={productImage}
            alt={productName}
            className="cart-item-image"
          />
        )}

        <div className="cart-item-details">
          <h4 className="cart-item-name">{productName}</h4>

          {productDescription && (
            <p className="cart-item-description">{productDescription}</p>
          )}

          <div className="cart-item-price-row">
            <span className="cart-item-price">
              ${formatPrice(pricePerUnit)}
            </span>
            {item.quantity > 1 && (
              <span className="cart-item-total">
                Total: ${formatPrice(itemTotal)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="cart-item-controls">
        <div className="cart-item-quantity-container">
          <button
            onClick={handleDecrease}
            className="cart-item-quantity-btn"
            title={item.quantity === 1 ? 'Eliminar' : 'Disminuir'}
          >
            {item.quantity === 1 ? '🗑️' : '−'}
          </button>

          <span className="cart-item-quantity">{item.quantity}</span>

          <button
            onClick={handleIncrease}
            className="cart-item-quantity-btn"
          >
            +
          </button>
        </div>

        {/* Notes Toggle */}
        {onUpdateNotes && (
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="cart-item-notes-toggle"
            title="Agregar notas"
          >
            📝 {showNotes ? 'Ocultar' : 'Notas'}
          </button>
        )}
      </div>

      {/* Notes Input */}
      {showNotes && onUpdateNotes && (
        <div className="cart-item-notes-container">
          <textarea
            className="cart-item-notes-input"
            placeholder="Ej: Sin cebolla, agregar mayonesa..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            maxLength={200}
            rows={2}
          />
        </div>
      )}
    </div>
  );
};

export default CartItem;
