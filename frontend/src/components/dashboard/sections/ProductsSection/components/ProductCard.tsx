import React from 'react';
import { ProductCardProps } from '../types';

const ProductRow: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  if (!product || !product.id) return null;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(n ?? 0);

  const created =
    product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '—';

  return (
    <div className="products-row">
      {/* Columna: Producto (thumb + textos) */}
      <div className="cell cell-product">
        <div className="thumb">
          {product.fotoUrl ? (
            <img src={product.fotoUrl} alt={product.nombre} />
          ) : (
            <div className="thumb-placeholder">📦</div>
          )}
        </div>
        <div className="pinfo">
          <h4 className="ptitle">{product.nombre}</h4>
          <p className="pdesc">{product.descripcion || 'Sin descripción'}</p>
        </div>
      </div>

      {/* Columna: Estado */}
      <div className="cell cell-status">
        <span className={`status-badge ${product.activo ? 'status-active' : 'status-inactive'}`}>
          {product.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Columna: Precio */}
      <div className="cell cell-price">
        <span className="price-value">{formatPrice(product.precio as number)}</span>
      </div>

      {/* Columna: Fecha */}
      <div className="cell cell-date">{created}</div>

      {/* Columna: Acciones */}
      <div className="cell cell-actions">
        <button className="btn-secondary" onClick={() => onEdit(product)}>Editar</button>
        <button className="btn-danger" onClick={() => onDelete(product.id)}>Eliminar</button>
      </div>
    </div>
  );
};

export default ProductRow;
