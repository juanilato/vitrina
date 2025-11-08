import React, { useState } from 'react';
import { ProductCardProps } from '../types';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

const ProductRow: React.FC<ProductCardProps> = ({ product, onEdit, onDelete, onManageStock }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!product || !product.id) return null;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(n ?? 0);

  const created =
    product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '—';

  const isActive = product.activo === true;

  const getStatusColor = () => {
    return isActive ? '#10b981' : '#dc2626'; // verde : rojo
  };

  return (
    <>
      <div className="products-row">
        {/* Columna: Producto (thumb + textos + chips) */}
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
            <div className="product-chips-row">
              <div className="product-chip product-chip-status" style={{
                borderColor: isActive ? '#bbf7d0' : '#fecaca',
                background: isActive ? '#f0fdf4' : '#fef2f2',
                color: isActive ? '#059669' : '#dc2626'
              }}>
                {isActive ? (
                  <CheckCircleOutlineOutlinedIcon fontSize="small" />
                ) : (
                  <HighlightOffOutlinedIcon fontSize="small" />
                )}
                <span>{isActive ? 'Activo' : 'Inactivo'}</span>
              </div>
              {product.precio && (
                <div className="product-chip product-chip-price">
                  <AttachMoneyOutlinedIcon fontSize="small" />
                  <span>{formatPrice(product.precio as number)}</span>
                </div>
              )}
            </div>
            <p className="pdesc">{product.descripcion || 'Sin descripción'}</p>
          </div>
        </div>

        {/* Columna: Estado visual */}
        <div className="cell cell-status">
          <div className="stock-indicator" style={{ backgroundColor: getStatusColor() }}>
            <div className="stock-indicator-label">
              {isActive ? 'Activo' : 'Inactivo'}
            </div>
          </div>
        </div>



        {/* Columna: Fecha */}
        <div className="cell cell-date">
          <div className="date-display">
            <CalendarTodayOutlinedIcon fontSize="small" style={{ color: '#9ca3af' }} />
            <span>{created}</span>
          </div>
        </div>

        {/* Columna: Acciones */}
        <div className="cell cell-actions">
          <button
            className="btn-action btn-action-stock"
            onClick={() => onManageStock?.(product)}
            title="Gestionar stock"
          >
            <Inventory2OutlinedIcon fontSize="small" />
            <span className="btn-text">Stock</span>
          </button>
          <button
            className="btn-action btn-action-edit"
            onClick={() => onEdit(product)}
            title="Editar producto"
          >
            <EditOutlinedIcon fontSize="small" />
            <span className="btn-text">Editar</span>
          </button>
          <button
            className="btn-action btn-action-delete"
            onClick={() => setShowDeleteConfirm(true)}
            title="Eliminar producto"
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
            <span className="btn-text">Eliminar</span>
          </button>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content modal-content-small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Eliminar producto</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                ¿Estás seguro de que deseas eliminar <strong>{product.nombre}</strong>?
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  onDelete(product.id);
                  setShowDeleteConfirm(false);
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductRow;
