import React, { useState } from 'react';
import { ProductoIngrediente } from '../types';
import { useIngredientes } from '../../IngredientsSection/hooks/useIngredientes';

interface ProductIngredientSectionProps {
  tipoStock: 'individual' | 'compuesto';
  stockIndividual: number;
  permiteExtras: boolean;
  ingredientesProducto: ProductoIngrediente[];
  onStockChange: (value: string) => void;
  onTipoStockChange: (tipo: 'individual' | 'compuesto') => void;
  onPermiteExtrasChange: (permite: boolean) => void;
  onIngredientesChange: (ingredientes: ProductoIngrediente[]) => void;
}

const ProductIngredientSection: React.FC<ProductIngredientSectionProps> = ({
  tipoStock,
  stockIndividual,
  permiteExtras,
  ingredientesProducto,
  onStockChange,
  onTipoStockChange,
  onPermiteExtrasChange,
  onIngredientesChange
}) => {
  // Estado local para la selección de ingredientes
  const [selectedIngredienteId, setSelectedIngredienteId] = useState<string>('');
  const [cantidadIngrediente, setCantidadIngrediente] = useState<string>('1');
  const [esExtraPermitido, setEsExtraPermitido] = useState<boolean>(false);
  const [precioExtra, setPrecioExtra] = useState<string>('');
  const [minimoExtra, setMinimoExtra] = useState<string>('1');
  const [maximoExtra, setMaximoExtra] = useState<string>('');
  const [editingIngredienteId, setEditingIngredienteId] = useState<string | null>(null);

  // Usar el hook de ingredientes
  const {
    ingredientes,
    loading: loadingIngredientes,
    addIngredienteToProduct,
    removeIngredienteFromProduct
  } = useIngredientes();

  // Función para agregar un ingrediente al producto
  const handleAddIngrediente = () => {
    if (!selectedIngredienteId || !cantidadIngrediente) return;

    try {
      const cantidad = parseFloat(cantidadIngrediente);
      if (isNaN(cantidad) || cantidad <= 0) {
        alert('La cantidad debe ser un número positivo');
        return;
      }

      // Validar precio extra si es extra permitido
      if (esExtraPermitido && precioExtra) {
        const precio = parseFloat(precioExtra);
        if (isNaN(precio) || precio < 0) {
          alert('El precio extra debe ser un número válido');
          return;
        }
      }

      // Validar mínimo extra
      let minimo: number | undefined;
      if (esExtraPermitido && minimoExtra) {
        minimo = parseInt(minimoExtra);
        if (isNaN(minimo) || minimo < 1) {
          alert('El mínimo debe ser al menos 1');
          return;
        }
      }

      // Validar máximo extra
      let maximo: number | undefined;
      if (esExtraPermitido && maximoExtra) {
        maximo = parseInt(maximoExtra);
        if (isNaN(maximo) || maximo < 1) {
          alert('El máximo debe ser mayor a 0');
          return;
        }
        if (minimo && maximo < minimo) {
          alert('El máximo debe ser mayor o igual al mínimo');
          return;
        }
      }

      const nuevosIngredientes = addIngredienteToProduct(
        ingredientesProducto,
        selectedIngredienteId,
        cantidad,
        esExtraPermitido,
        precioExtra ? parseFloat(precioExtra) : undefined,
        minimo,
        maximo
      );

      onIngredientesChange(nuevosIngredientes);
      handleCancelEdit(); // Limpiar el formulario después de agregar/actualizar
    } catch (error: any) {
      alert(error.message || 'Error al agregar ingrediente');
    }
  };

  // Función para cargar un ingrediente para edición
  const handleEditIngrediente = (ingrediente: ProductoIngrediente) => {
    setSelectedIngredienteId(ingrediente.ingredienteId);
    setCantidadIngrediente(String(ingrediente.cantidadRequerida));
    setEsExtraPermitido(ingrediente.esExtraPermitido || false);
    setPrecioExtra(ingrediente.precioExtra ? String(ingrediente.precioExtra) : '');
    setMinimoExtra(ingrediente.minimoExtra ? String(ingrediente.minimoExtra) : '1');
    setMaximoExtra(ingrediente.maximoExtra ? String(ingrediente.maximoExtra) : '');
    setEditingIngredienteId(ingrediente.ingredienteId);
  };

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setSelectedIngredienteId('');
    setCantidadIngrediente('1');
    setEsExtraPermitido(false);
    setPrecioExtra('');
    setMinimoExtra('1');
    setMaximoExtra('');
    setEditingIngredienteId(null);
  };

  // Función para eliminar un ingrediente del producto
  const handleRemoveIngrediente = (ingredienteId: string) => {
    const nuevosIngredientes = removeIngredienteFromProduct(
      ingredientesProducto,
      ingredienteId
    );
    onIngredientesChange(nuevosIngredientes);
    // Si estamos editando este ingrediente, cancelar la edición
    if (editingIngredienteId === ingredienteId) {
      handleCancelEdit();
    }
  };

  const getStockChipInfo = () => {
    if (tipoStock === 'individual') {
      if (stockIndividual === 0) return { label: 'Sin stock', color: '#dc2626', bg: '#fef2f2' };
      if (stockIndividual < 10) return { label: 'Stock bajo', color: '#f59e0b', bg: '#fef3c7' };
      return { label: 'Stock disponible', color: '#10b981', bg: '#d1fae5' };
    }
    return { label: 'Stock por ingredientes', color: '#3b82f6', bg: '#dbeafe' };
  };

  const stockChipInfo = getStockChipInfo();

  return (
    <div className="order-modal-section">
      <h3 className="modal-section-title">📦 Gestión de Stock</h3>

      {/* Chips informativos de estado */}
      <div className="order-modal-chips-section" style={{ marginBottom: '16px' }}>
        <div
          className="order-chip order-chip-delivery"
          style={{ backgroundColor: stockChipInfo.bg, color: stockChipInfo.color, borderColor: stockChipInfo.color }}
        >
          📦
          <span>{stockChipInfo.label}</span>
        </div>
        {tipoStock === 'individual' && stockIndividual > 0 && (
          <div className="order-chip order-chip-payment">
            🔢
            <span>{stockIndividual} unidades</span>
          </div>
        )}
        {tipoStock === 'compuesto' && ingredientesProducto.length > 0 && (
          <div className="order-chip order-chip-email">
            🍴
            <span>{ingredientesProducto.length} ingrediente{ingredientesProducto.length !== 1 ? 's' : ''}</span>
          </div>
        )}
        {tipoStock === 'compuesto' && permiteExtras && (
          <div className="order-chip" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#16a34a' }}>
            ➕
            <span>Permite Extras</span>
          </div>
        )}
      </div>

      {/* Chips para selección de tipo de stock */}
      <div className="order-modal-chips-section" style={{ marginBottom: '16px' }}>
        <div
          className={`order-chip ${tipoStock === 'individual' ? 'order-chip-delivery' : 'order-chip-payment'}`}
          style={{ cursor: 'pointer' }}
          onClick={() => onTipoStockChange('individual')}
        >
          {tipoStock === 'individual' ? '✅' : '⚪'}
          <span>Stock Individual</span>
        </div>
        <div
          className={`order-chip ${tipoStock === 'compuesto' ? 'order-chip-delivery' : 'order-chip-payment'}`}
          style={{ cursor: 'pointer' }}
          onClick={() => onTipoStockChange('compuesto')}
        >
          {tipoStock === 'compuesto' ? '✅' : '⚪'}
          <span>Stock Compuesto</span>
        </div>
      </div>

      {tipoStock === 'individual' ? (
        <div className="pm2-field pm2-field-enhanced">
          <label htmlFor="pm2-stock">
            <span className="pm2-label-icon">🔢</span>
            Stock Disponible
          </label>
          <div className="pm2-input-wrapper">
            <input
              id="pm2-stock"
              type="text"
              inputMode="numeric"
              value={stockIndividual.toString()}
              onChange={(e) => onStockChange(e.target.value)}
              placeholder="Ingrese cantidad disponible"
              className="pm2-input-modern"
            />
            <span className="pm2-input-hint">unidades disponibles</span>
          </div>
        </div>
      ) : (
        <div className="pm2-ingredients-section">
          <div className="pm2-field">
            <label className="pm2-checkbox-label">
              <input
                type="checkbox"
                className="pm2-checkbox"
                checked={permiteExtras}
                onChange={(e) => onPermiteExtrasChange(e.target.checked)}
              />
              <span className="pm2-checkbox-text">Permitir ingredientes extra</span>
            </label>
          </div>

          {/* Selector de ingredientes */}
          <div className="pm2-ingredients-add">
            <div className="pm2-row">
              <div className="pm2-field pm2-field-enhanced" style={{ flex: 2 }}>
                <label htmlFor="pm2-ingrediente">
                  <span className="pm2-label-icon">🍴</span>
                  Ingrediente
                </label>
                <div className="pm2-input-wrapper">
                  <select
                    id="pm2-ingrediente"
                    className="pm2-select pm2-input-modern"
                    value={selectedIngredienteId}
                    onChange={(e) => setSelectedIngredienteId(e.target.value)}
                    disabled={loadingIngredientes}
                  >
                    <option value="">Seleccionar ingrediente...</option>
                    {ingredientes.map(ing => (
                      <option key={ing.id} value={ing.id}>
                        {ing.nombre} ({ing.unidadMedida})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pm2-field pm2-field-enhanced">
                <label htmlFor="pm2-cantidad">
                  <span className="pm2-label-icon">📊</span>
                  Cantidad
                </label>
                <div className="pm2-input-wrapper">
                  <input
                    id="pm2-cantidad"
                    type="text"
                    inputMode="numeric"
                    value={cantidadIngrediente}
                    onChange={(e) => setCantidadIngrediente(e.target.value)}
                    placeholder="Ej: 2"
                    className="pm2-input-modern"
                  />
                </div>
              </div>
            </div>

            <div className="pm2-field">
              <label className="pm2-checkbox-label">
                <input
                  type="checkbox"
                  className="pm2-checkbox"
                  checked={esExtraPermitido}
                  onChange={(e) => setEsExtraPermitido(e.target.checked)}
                />
                <span className="pm2-checkbox-text">Permitir como extra</span>
              </label>
            </div>

            {/* Campos adicionales si es extra permitido */}
            {esExtraPermitido && (
              <div className="pm2-extra-fields">
                {/* Chips informativos para extras */}
                <div className="order-modal-chips-section" style={{ marginBottom: '12px' }}>
                  <div className="order-chip" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#16a34a' }}>
                    ➕
                    <span>Configurando extra</span>
                  </div>
                  {precioExtra && parseFloat(precioExtra) > 0 && (
                    <div className="order-chip order-chip-payment">
                      💰
                      <span>+${parseFloat(precioExtra).toFixed(2)}</span>
                    </div>
                  )}
                  {(minimoExtra || maximoExtra) && (
                    <div className="order-chip order-chip-email">
                      📊
                      <span>Rango: {minimoExtra || '1'} - {maximoExtra || '∞'}</span>
                    </div>
                  )}
                </div>

                <div className="pm2-row">
                  <div className="pm2-field pm2-field-enhanced">
                    <label htmlFor="pm2-precio-extra">
                      <span className="pm2-label-icon">💰</span>
                      Precio Extra
                    </label>
                    <div className="pm2-input-wrapper">
                      <div className="pm2-input-adorn">
                        <span className="pm2-adorn">$</span>
                        <input
                          id="pm2-precio-extra"
                          type="text"
                          inputMode="decimal"
                          value={precioExtra}
                          onChange={(e) => setPrecioExtra(e.target.value)}
                          placeholder="0.00"
                          className="pm2-input-modern"
                        />
                      </div>
                      <span className="pm2-input-hint">precio adicional</span>
                    </div>
                  </div>
                  <div className="pm2-field pm2-field-enhanced">
                    <label htmlFor="pm2-minimo">
                      <span className="pm2-label-icon">⬇️</span>
                      Mínimo
                    </label>
                    <div className="pm2-input-wrapper">
                      <input
                        id="pm2-minimo"
                        type="text"
                        inputMode="numeric"
                        value={minimoExtra}
                        onChange={(e) => setMinimoExtra(e.target.value)}
                        placeholder="1"
                        className="pm2-input-modern"
                      />
                    </div>
                  </div>
                  <div className="pm2-field pm2-field-enhanced">
                    <label htmlFor="pm2-maximo">
                      <span className="pm2-label-icon">⬆️</span>
                      Máximo
                    </label>
                    <div className="pm2-input-wrapper">
                      <input
                        id="pm2-maximo"
                        type="text"
                        inputMode="numeric"
                        value={maximoExtra}
                        onChange={(e) => setMaximoExtra(e.target.value)}
                        placeholder="Sin límite"
                        className="pm2-input-modern"
                      />
                      <span className="pm2-input-hint">opcional</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="order-modal-action-buttons">
              <button
                type="button"
                className="order-modal-btn order-modal-btn-primary"
                onClick={handleAddIngrediente}
                disabled={!selectedIngredienteId || loadingIngredientes}
              >
                {editingIngredienteId ? '✏️ Actualizar Ingrediente' : '➕ Agregar Ingrediente'}
              </button>
              {editingIngredienteId && (
                <button
                  type="button"
                  className="order-modal-btn order-modal-btn-close"
                  onClick={handleCancelEdit}
                >
                  ❌ Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Lista de ingredientes agregados */}
          <div className="pm2-ingredients-list">
            <h3 className="modal-section-title">🍴 Ingredientes del producto</h3>
            {ingredientesProducto.length === 0 ? (
              <p className="pm2-empty-message">No hay ingredientes agregados</p>
            ) : (
              <div className="order-modal-items-list">
                {ingredientesProducto.map(ing => (
                  <div
                    key={ing.ingredienteId}
                    className={`order-modal-item-row ${editingIngredienteId === ing.ingredienteId ? 'editing' : ''}`}
                  >
                    <div className="order-modal-item-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="pm2-ingredient-icon" style={{ fontSize: '28px' }}>{ing.icono || '🍴'}</span>
                        <div>
                          <div className="order-modal-item-name">{ing.nombre}</div>
                          <div className="order-modal-item-qty">
                            {ing.cantidadRequerida} {ing.unidadMedida}
                          </div>
                          {ing.esExtraPermitido && (
                            <div className="order-modal-chips-section" style={{ marginTop: '8px', gap: '6px' }}>
                              <span className="order-chip" style={{ fontSize: '10px', padding: '4px 8px' }}>
                                ➕ Extra
                              </span>
                              {ing.precioExtra && (
                                <span className="order-chip order-chip-payment" style={{ fontSize: '10px', padding: '4px 8px' }}>
                                  💵 +${ing.precioExtra}
                                </span>
                              )}
                              {(ing.minimoExtra || ing.maximoExtra) && (
                                <span className="order-chip order-chip-email" style={{ fontSize: '10px', padding: '4px 8px' }}>
                                  📊 {ing.minimoExtra || 1} - {ing.maximoExtra || '∞'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="pm2-ingredient-actions" style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="order-modal-btn order-modal-btn-map"
                        onClick={() => handleEditIngrediente(ing)}
                        aria-label={`Editar ${ing.nombre}`}
                        title="Editar ingrediente"
                        style={{ padding: '8px 12px' }}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="pm2-soft danger"
                        onClick={() => handleRemoveIngrediente(ing.ingredienteId)}
                        aria-label={`Eliminar ${ing.nombre}`}
                        title="Eliminar ingrediente"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductIngredientSection;