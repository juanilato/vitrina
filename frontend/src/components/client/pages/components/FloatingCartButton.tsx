

// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/company/site/components/FloatingCartButton.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';

export const FloatingCartButton: React.FC<{ totalItems: number; onClick: () => void }> = ({ totalItems, onClick }) => (
  <button className="floating-cart-btn-clean" onClick={onClick}>
    <span className="cart-icon">🛒</span>
    <span className="cart-text">Tu pedido</span>
    <span className="cart-total">{totalItems}</span>
  </button>
);
