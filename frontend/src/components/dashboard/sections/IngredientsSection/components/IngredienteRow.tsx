import React, { useState } from 'react';
import { IngredienteRowProps } from '../types';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { DEFAULT_EMOJI } from './emojiData';

const IngredienteRow: React.FC<IngredienteRowProps> = ({ ingrediente, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!ingrediente || !ingrediente.id) return null;

  // Usar emoji del ingrediente o emoji por defecto
  const emoji = ingrediente.icono || DEFAULT_EMOJI;

  const stock = ingrediente.stockDisponible ?? 0;
  const unidad = ingrediente.unidadMedida || 'unidades';
  const isInStock = stock > 0;

  const getStockColor = () => {
    if (stock === 0) return '#dc2626'; // rojo
    if (stock < 10) return '#f59e0b'; // naranja/amarillo
    return '#10b981'; // verde
  };

  return (
    <>
      <div className="ingredient-row">
        {/* Columna: Ingrediente (Emoji + textos + chips) */}
        <div className="cell cell-ingredient">
          <div className="ingredient-icon-wrapper" style={{ fontSize: '2.5rem' }}>
            {emoji}
          </div>
          <div className="ingredient-info">
            <h4 className="ingredient-name">{ingrediente.nombre}</h4>
            <div className="ingredient-chips-row">
              <div className="ingredient-chip ingredient-chip-stock" style={{
                borderColor: isInStock ? '#bbf7d0' : '#fecaca',
                background: isInStock ? '#f0fdf4' : '#fef2f2',
                color: isInStock ? '#059669' : '#dc2626'
              }}>
                <InventoryOutlinedIcon fontSize="small" />
                <span>{isInStock ? 'En Stock' : 'Agotado'}</span>
              </div>
              <div className="ingredient-chip ingredient-chip-unit">
                <StraightenOutlinedIcon fontSize="small" />
                <span>{unidad}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna: Estado visual */}
        <div className="cell cell-status">
          <div className="stock-indicator" style={{ backgroundColor: getStockColor() }}>
            <div className="stock-indicator-label">
              {stock === 0 ? 'Sin stock' : stock < 10 ? 'Stock bajo' : 'Disponible'}
            </div>
          </div>
        </div>

        {/* Columna: Cantidad */}
        <div className="cell cell-quantity">
          <div className="quantity-display">
            <div className="quantity-number" style={{ color: getStockColor() }}>
              {stock.toLocaleString()}
            </div>
            <div className="quantity-unit">{unidad}</div>
          </div>
        </div>

        {/* Columna: Unidad de medida (destacada) */}
        <div className="cell cell-unit">
          <div className="unit-badge">
            {unidad.charAt(0).toUpperCase() + unidad.slice(1)}
          </div>
        </div>

        {/* Columna: Acciones */}
        <div className="cell cell-actions">
          <button
            className="btn-action btn-action-edit"
            onClick={() => onEdit(ingrediente)}
            title="Editar ingrediente"
          >
            <EditOutlinedIcon fontSize="small" />
            <span className="btn-text">Editar</span>
          </button>
          <button
            className="btn-action btn-action-delete"
            onClick={() => setShowDeleteConfirm(true)}
            title="Eliminar ingrediente"
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
              <h2>Eliminar ingrediente</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                ¿Estás seguro de que deseas eliminar <strong>{ingrediente.nombre}</strong>?
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
                  onDelete(ingrediente.id);
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

export default IngredienteRow;