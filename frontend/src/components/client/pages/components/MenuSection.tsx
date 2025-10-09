
// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/company/site/components/MenuSection.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import CompanyStoreProductCard from '../CompanyStoreProductCard';
import { Product, CartItem } from '../../types';

export const MenuSection: React.FC<{
  products: Product[];
  getCartItem: (id: string) => CartItem | undefined;
  onAddToCart: (p: Product, q: number) => void;
  onProductClick: (p: Product) => void;
}> = ({ products, getCartItem, onAddToCart, onProductClick }) => (
  <section className="products-section-clean">
    <h2 className="section-title">Menú / Catálogo</h2>
    <div className="products-grid-clean">
      {products.filter((p) => p.activo).length === 0 ? (
        <div className="no-products-clean">
          <div className="empty-icon">📦</div>
          <h3 className="empty-title">No hay productos disponibles</h3>
          <p className="empty-description">Esta empresa aún no ha publicado productos activos.</p>
        </div>
      ) : (
        products.filter((p) => p.activo).map((p) => (
          <CompanyStoreProductCard
            key={p.id}
            product={p}
            onAddToCart={onAddToCart}
          
            cartItem={getCartItem(p.id)}
          />
        ))
      )}
    </div>
  </section>
);
