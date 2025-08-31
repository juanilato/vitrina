import React from 'react';
import { ProductCardProps } from '../types';

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  // Validar que el producto tenga los campos mínimos necesarios
  if (!product || !product.id) {
    return null;
  }

  const getStatusBadge = (activo: boolean) => {
    return (
      <span className={`status-badge ${activo ? 'status-active' : 'status-inactive'}`}>
        {activo ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  return (
    <div key={product.id} className="product-card">
      <div className="product-image">
        {product.fotoUrl ? (
          <img src={product.fotoUrl} alt={product.nombre} />
        ) : (
          <div className="product-placeholder">
            <span className="placeholder-icon">📦</span>
          </div>
        )}
      </div>
      
      <div className="product-content">
        <div className="product-header">
          <h3 className="product-name">{product.nombre}</h3>
          {getStatusBadge(product.activo)}
        </div>
        
        <p className="product-description">
          {product.descripcion || 'Sin descripción'}
        </p>
        
        <div className="product-details">
          <div className="product-price">
            <span className="price-label">Precio:</span>
            <span className="price-value">${product.precio}</span>
          </div>
          
          {product.createdAt && (
            <div className="product-date">
              <span className="date-label">Creado:</span>
              <span className="date-value">
                {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="product-actions">
        <button 
          className="btn-secondary edit-btn"
          onClick={() => onEdit(product)}
        >
          <span className="btn-icon">✏️</span>
          Editar
        </button>
        <button 
          className="btn-danger delete-btn"
          onClick={() => onDelete(product.id)}
        >
          <span className="btn-icon">🗑️</span>
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
