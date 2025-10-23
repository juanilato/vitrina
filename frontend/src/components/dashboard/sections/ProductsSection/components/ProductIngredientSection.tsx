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

  return (
    <div className="pm2-section">
      <h3 className="pm2-section-title">Gestión de Stock</h3>
      
      <div className="pm2-field">
        <label>Tipo de Stock</label>
        <div className="pm2-segment">
          <button
            type="button"
            className={`pm2-seg-btn ${tipoStock === 'individual' ? 'is-active' : ''}`}
            onClick={() => onTipoStockChange('individual')}
            aria-pressed={tipoStock === 'individual'}
          >
            Individual
          </button>
          <button
            type="button"
            className={`pm2-seg-btn ${tipoStock === 'compuesto' ? 'is-active' : ''}`}
            onClick={() => onTipoStockChange('compuesto')}
            aria-pressed={tipoStock === 'compuesto'}
          >
            Compuesto
          </button>
        </div>
      </div>

      {tipoStock === 'individual' ? (
        <div className="pm2-field">
          <label htmlFor="pm2-stock">Stock Disponible</label>
          <input
            id="pm2-stock"
            type="text"
            inputMode="numeric"
            value={stockIndividual.toString()}
            onChange={(e) => onStockChange(e.target.value)}
            placeholder="0"
          />
        </div>
      ) : (
        <div className="pm2-ingredients-section">
          <div className="pm2-field">
            <label>
              <input
                type="checkbox"
                checked={permiteExtras}
                onChange={(e) => onPermiteExtrasChange(e.target.checked)}
              />
              Permitir ingredientes extra
            </label>
          </div>

          {/* Selector de ingredientes */}
          <div className="pm2-ingredients-add">
            <div className="pm2-row">
              <div className="pm2-field" style={{ flex: 2 }}>
                <label htmlFor="pm2-ingrediente">Ingrediente</label>
                <select
                  id="pm2-ingrediente"
                  value={selectedIngredienteId}
                  onChange={(e) => setSelectedIngredienteId(e.target.value)}
                  disabled={loadingIngredientes}
                >
                  <option value="">Seleccionar ingrediente</option>
                  {ingredientes.map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.nombre} ({ing.unidadMedida})
                    </option>
                  ))}
                </select>
              </div>
              <div className="pm2-field">
                <label htmlFor="pm2-cantidad">Cantidad</label>
                <input
                  id="pm2-cantidad"
                  type="text"
                  inputMode="numeric"
                  value={cantidadIngrediente}
                  onChange={(e) => setCantidadIngrediente(e.target.value)}
                  placeholder="1"
                />
              </div>
            </div>
            
            <div className="pm2-field">
              <label>
                <input
                  type="checkbox"
                  checked={esExtraPermitido}
                  onChange={(e) => setEsExtraPermitido(e.target.checked)}
                />
                Permitir como extra
              </label>
            </div>

            {/* Campos adicionales si es extra permitido */}
            {esExtraPermitido && (
              <div className="pm2-extra-fields">
                <div className="pm2-row">
                  <div className="pm2-field">
                    <label htmlFor="pm2-precio-extra">Precio Extra</label>
                    <input
                      id="pm2-precio-extra"
                      type="text"
                      inputMode="decimal"
                      value={precioExtra}
                      onChange={(e) => setPrecioExtra(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="pm2-field">
                    <label htmlFor="pm2-minimo">Mínimo</label>
                    <input
                      id="pm2-minimo"
                      type="text"
                      inputMode="numeric"
                      value={minimoExtra}
                      onChange={(e) => setMinimoExtra(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  <div className="pm2-field">
                    <label htmlFor="pm2-maximo">Máximo</label>
                    <input
                      id="pm2-maximo"
                      type="text"
                      inputMode="numeric"
                      value={maximoExtra}
                      onChange={(e) => setMaximoExtra(e.target.value)}
                      placeholder="Sin límite"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pm2-button-group">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddIngrediente}
                disabled={!selectedIngredienteId || loadingIngredientes}
              >
                {editingIngredienteId ? 'Actualizar Ingrediente' : 'Agregar Ingrediente'}
              </button>
              {editingIngredienteId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Lista de ingredientes agregados */}
          <div className="pm2-ingredients-list">
            <h4>Ingredientes del producto</h4>
            {ingredientesProducto.length === 0 ? (
              <p className="pm2-empty-message">No hay ingredientes agregados</p>
            ) : (
              <ul className="pm2-ingredients">
                {ingredientesProducto.map(ing => (
                  <li
                    key={ing.ingredienteId}
                    className={`pm2-ingredient-item ${editingIngredienteId === ing.ingredienteId ? 'editing' : ''}`}
                  >
                    <div className="pm2-ingredient-info">
                      <span className="pm2-ingredient-icon">{ing.icono || '🍴'}</span>
                      <div className="pm2-ingredient-details">
                        <div className="pm2-ingredient-row">
                          <span className="pm2-ingredient-name">{ing.nombre}</span>
                          <span className="pm2-ingredient-qty">
                            {ing.cantidadRequerida} {ing.unidadMedida}
                          </span>
                        </div>
                        {ing.esExtraPermitido && (
                          <div className="pm2-ingredient-extra-info">
                            <span className="pm2-ingredient-extra-badge">Extra</span>
                            {ing.precioExtra && (
                              <span className="pm2-ingredient-price">+${ing.precioExtra}</span>
                            )}
                            {(ing.minimoExtra || ing.maximoExtra) && (
                              <span className="pm2-ingredient-limits">
                                ({ing.minimoExtra || 1} - {ing.maximoExtra || '∞'})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pm2-ingredient-actions">
                      <button
                        type="button"
                        className="pm2-ingredient-edit"
                        onClick={() => handleEditIngrediente(ing)}
                        aria-label={`Editar ${ing.nombre}`}
                        title="Editar ingrediente"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="pm2-ingredient-remove"
                        onClick={() => handleRemoveIngrediente(ing.ingredienteId)}
                        aria-label={`Eliminar ${ing.nombre}`}
                        title="Eliminar ingrediente"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductIngredientSection;