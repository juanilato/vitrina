// src/features/ingredientes/components/IngredienteRow.tsx (Nuevo Archivo)

import React from 'react';
import { IngredienteRowProps } from '../types';
import * as MuiIcons from '@mui/icons-material';

const IngredienteRow: React.FC<IngredienteRowProps> = ({ ingrediente, onEdit, onDelete }) => {
  if (!ingrediente || !ingrediente.id) return null;

  // Renderización dinámica del icono
  const IconComponent = MuiIcons[ingrediente.icono as keyof typeof MuiIcons] || MuiIcons.LocalGroceryStore;
  
  const stock = ingrediente.stockDisponible ?? 0;
  const unidad = ingrediente.unidadMedida || 'unidades';

  return (
    // Reutilizamos la clase de fila, adaptando las celdas
    <div className="products-row"> 
      
      {/* Columna: Ingrediente (Icono + textos) */}
      <div className="cell cell-product">
        <div className="thumb">
          <div className="thumb-placeholder">
            <IconComponent fontSize="medium" />
          </div>
        </div>
        <div className="pinfo">
          <h4 className="ptitle">{ingrediente.nombre}</h4>
          <p className="pdesc">{ingrediente.empresaId ? 'ID de empresa: ' + ingrediente.empresaId.substring(0, 8) + '...' : ''}</p>
        </div>
      </div>

      {/* Columna: Stock */}
      <div className="cell cell-status">
        <span className={`status-badge ${stock > 0 ? 'status-active' : 'status-inactive'}`}>
          {stock > 0 ? 'En Stock' : 'Agotado'}
        </span>
      </div>

      {/* Columna: Cantidad / Unidad de Medida */}
      <div className="cell cell-price" style={{ textAlign: 'left' }}>
        <span className="price-value" style={{ fontWeight: 700, fontSize: '14px' }}>
            {stock.toLocaleString()} {unidad}
        </span>
      </div>

      {/* Columna: Creado (usaremos "unidad medida" aquí, adaptando el formato) */}
      <div className="cell cell-date">
        Unidad: <span style={{ fontWeight: 700 }}>{unidad}</span>
      </div>

      {/* Columna: Acciones */}
      <div className="cell cell-actions">
        <button className="btn-secondary" onClick={() => onEdit(ingrediente)}>Editar</button>
        <button className="btn-danger" onClick={() => onDelete(ingrediente.id)}>Eliminar</button>
      </div>
    </div>
  );
};

export default IngredienteRow;