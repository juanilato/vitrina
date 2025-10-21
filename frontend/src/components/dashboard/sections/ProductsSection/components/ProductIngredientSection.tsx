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
      
      const nuevosIngredientes = addIngredienteToProduct(
        ingredientesProducto,
        selectedIngredienteId,
        cantidad,
        esExtraPermitido
      );
      
      onIngredientesChange(nuevosIngredientes);
      setSelectedIngredienteId('');
      setCantidadIngrediente('1');
      setEsExtraPermitido(false);
    } catch (error: any) {
      alert(error.message || 'Error al agregar ingrediente');
    }
  };

  // Función para eliminar un ingrediente del producto
  const handleRemoveIngrediente = (ingredienteId: string) => {
    const nuevosIngredientes = removeIngredienteFromProduct(
      ingredientesProducto,
      ingredienteId
    );
    onIngredientesChange(nuevosIngredientes);
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
            
            <button
              type="button"
              className="btn-secondary"
              onClick={handleAddIngrediente}
              disabled={!selectedIngredienteId || loadingIngredientes}
            >
              Agregar Ingrediente
            </button>
          </div>

          {/* Lista de ingredientes agregados */}
          <div className="pm2-ingredients-list">
            <h4>Ingredientes del producto</h4>
            {ingredientesProducto.length === 0 ? (
              <p className="pm2-empty-message">No hay ingredientes agregados</p>
            ) : (
              <ul className="pm2-ingredients">
                {ingredientesProducto.map(ing => (
                  <li key={ing.ingredienteId} className="pm2-ingredient-item">
                    <div className="pm2-ingredient-info">
                      <span className="pm2-ingredient-icon">{ing.icono || '🍴'}</span>
                      <span className="pm2-ingredient-name">{ing.nombre}</span>
                      <span className="pm2-ingredient-qty">
                        {ing.cantidadRequerida} {ing.unidadMedida}
                      </span>
                      {ing.esExtraPermitido && (
                        <span className="pm2-ingredient-extra">Extra</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="pm2-ingredient-remove"
                      onClick={() => handleRemoveIngrediente(ing.ingredienteId)}
                      aria-label={`Eliminar ${ing.nombre}`}
                    >
                      ×
                    </button>
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