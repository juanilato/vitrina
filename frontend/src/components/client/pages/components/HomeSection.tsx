

// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/company/site/components/HomeSection.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import CompanyStoreProductCard from '../CompanyStoreProductCard';
import { Product, CartItem } from '../../types';

export const HomeSection: React.FC<{
  companyName: string;
  products: Product[];
  getCartItem: (id: string) => CartItem | undefined;
  onAddToCart: (p: Product, q: number) => void;
  onProductClick: (p: Product) => void;
}> = ({ companyName, products, getCartItem, onAddToCart, onProductClick }) => (
  <div className="home-grid">
    <div className="home-panel">
      <h3>Novedades</h3>
      <p>Promociones, lanzamientos y avisos importantes de {companyName}.</p>
    </div>
    <div className="home-panel">
      <h3>Destacados</h3>
      <div className="products-grid-clean">
        {products.filter((p) => p.activo).slice(0, 4).map((p) => (
          <CompanyStoreProductCard
            key={p.id}
            product={p}
            onAddToCart={onAddToCart}
           
            cartItem={getCartItem(p.id)}
          />
        ))}
      </div>
    </div>
  </div>
);
