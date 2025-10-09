
// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/company/site/components/CartModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import CartSummary from './CartSummary';


import { Cart, CheckoutFormData } from '../../types';

type Props = {
  companyName: string;
  cart: Cart;
  onClose: () => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
 
  onCheckout: (companyId: string, formData: CheckoutFormData) => void;
  companyData: {
    id: string;
    name: string;
    logo?: string;
    ubicaciones: Array<{ id: number; direccion: string; lat: number; lng: number }>;
  };
};
export const CartModal: React.FC<Props> = ({
  companyName,
  cart,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  companyData,
}) => (
  <div className="cart-modal-overlay-fullscreen">
    <div className="cart-modal-fullscreen">
      <div className="cart-modal-header-fullscreen">
        <h3 className="cart-modal-title-fullscreen">Pedido de {companyName}</h3>
        <button className="close-cart-btn-fullscreen" onClick={onClose}>✕</button>
      </div>
      <div className="cart-modal-content-fullscreen">
        <CartSummary
          cart={cart}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onCheckout={onCheckout}          
          companyData={companyData}
        />
      </div>
    </div>
  </div>
);