import React, { useEffect, useState } from 'react';
import { ProductoIngrediente } from '../types';
import { useIngredientes } from '../../IngredientsSection/hooks/useIngredientes';
import './ProductModal.css';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';

interface StockManagementModalProps {
  product: {
    id: string;
    nombre: string;
    tipoStock?: string;
    stockIndividual?: number;
    permiteExtras?: boolean;
    ingredientes?: ProductoIngrediente[];
  };
  onSave: (data: {
    tipoStock: string;
    stockIndividual?: number;
    permiteExtras: boolean;
    ingredientes?: ProductoIngrediente[];
  }) => void;
  onClose: () => void;
}

const StockManagementModal: React.FC<StockManagementModalProps> = ({ product, onSave, onClose }) => {
  const [tipoStock, setTipoStock] = useState<'individual' | 'compuesto'>(
    (product?.tipoStock as 'individual' | 'compuesto') || 'individual'
  );
  const [stockIndividual, setStockIndividual] = useState(product?.stockIndividual ?? 0);
  const [permiteExtras, setPermiteExtras] = useState(product?.permiteExtras ?? false);
  const [ingredientesProducto, setIngredientesProducto] = useState<ProductoIngrediente[]>(
    product?.ingredientes || []
  );
  const [stockStr, setStockStr] = useState(
    product?.stockIndividual !== undefined ? String(product.stockIndividual) : '0'
  );
  const [saving, setSaving] = useState(false);

  // Estado local para la selección de ingredientes
  const [selectedIngredienteId, setSelectedIngredienteId] = useState<string>('');
  const [cantidadIngrediente, setCantidadIngrediente] = useState<string>('1');
  const [esExtraPermitido, setEsExtraPermitido] = useState<boolean>(false);
  const [precioExtra, setPrecioExtra] = useState<string>('');
  const [minimoExtra, setMinimoExtra] = useState<string>('1');
  const [maximoExtra, setMaximoExtra] = useState<string>('');
  const [editingIngredienteId, setEditingIngredienteId] = useState<string | null>(null);
  const [showInfoReference, setShowInfoReference] = useState(false);

  // Usar el hook de ingredientes
  const {
    ingredientes,
    loading: loadingIngredientes,
    addIngredienteToProduct,
    removeIngredienteFromProduct
  } = useIngredientes();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isValidNumberInput = (v: string) => /^\d*$/.test(v);
  const handleStockChange = (v: string) => {
    if (isValidNumberInput(v)) {
      setStockStr(v);
      setStockIndividual(parseInt(v, 10) || 0);
    }
  };

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

      setIngredientesProducto(nuevosIngredientes);
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
    setIngredientesProducto(nuevosIngredientes);
    // Si estamos editando este ingrediente, cancelar la edición
    if (editingIngredienteId === ingredienteId) {
      handleCancelEdit();
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const stockValue = tipoStock === 'individual' ? parseInt(stockStr, 10) : undefined;

      // Validar que si es stock compuesto tenga al menos un ingrediente
      if (tipoStock === 'compuesto' && ingredientesProducto.length === 0) {
        throw new Error('Un producto con stock compuesto debe tener al menos un ingrediente.');
      }

      await onSave({
        tipoStock,
        stockIndividual: stockValue,
        permiteExtras,
        ingredientes: tipoStock === 'compuesto' ? ingredientesProducto : undefined,
      });
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Error al guardar stock');
    } finally {
      setSaving(false);
    }
  };

  const getStockChipInfo = () => {
    if (tipoStock === 'individual') {
      const stock = parseInt(stockStr, 10) || 0;
      if (stock === 0) return { label: 'Sin stock', color: '#dc2626', bg: '#fef2f2' };
      if (stock < 10) return { label: 'Stock bajo', color: '#f59e0b', bg: '#fef3c7' };
      return { label: 'Stock disponible', color: '#10b981', bg: '#d1fae5' };
    }
    return { label: 'Stock por ingredientes', color: '#3b82f6', bg: '#dbeafe' };
  };

  const stockChipInfo = getStockChipInfo();

  return (
    <div className="pm2-overlay" onClick={onClose}>
      <section
        className="pm2-dialog order-modal-modern"
        role="dialog"
        aria-modal="true"
        aria-label="Gestión de Stock"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header moderno */}
        <header className="order-modal-header">
          <div className="order-modal-header-left">
            <div className="order-modal-header-info">
              <div className="order-modal-client-name">📦 Gestión de Stock</div>
              <div className="order-modal-date">Configura el stock para {product.nombre}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn-info-icon"
              onClick={() => setShowInfoReference(!showInfoReference)}
              title="Ver diferencia entre stock individual y compuesto"
              style={{ width: '36px', height: '36px' }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </button>
            <button className="modal-close-modern" onClick={onClose} aria-label="Cerrar">×</button>
          </div>
        </header>

        {/* Body */}
        <div className="order-modal-body">
          {/* Chips informativos de estado */}
          <div className="order-modal-chips-section">
            <div
              className="order-chip order-chip-delivery"
              style={{ backgroundColor: stockChipInfo.bg, color: stockChipInfo.color, borderColor: stockChipInfo.color }}
            >
              📦
              <span>{stockChipInfo.label}</span>
            </div>
            {tipoStock === 'individual' && parseInt(stockStr, 10) > 0 && (
              <div className="order-chip order-chip-payment">
                🔢
                <span>{parseInt(stockStr, 10)} unidades</span>
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

          <form className="pm2-form" onSubmit={submit}>
            <div className="order-modal-section">
              <h3 className="modal-section-title">📦 Configuración de Stock</h3>

              {/* Chips para selección de tipo de stock */}
              <div className="order-modal-chips-section" style={{ marginBottom: '16px' }}>
                <div
                  className={`order-chip ${tipoStock === 'individual' ? 'order-chip-delivery' : 'order-chip-payment'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setTipoStock('individual')}
                >
                  {tipoStock === 'individual' ? '✅' : '⚪'}
                  <span>Stock Individual</span>
                </div>
                <div
                  className={`order-chip ${tipoStock === 'compuesto' ? 'order-chip-delivery' : 'order-chip-payment'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setTipoStock('compuesto')}
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
                      value={stockStr}
                      onChange={(e) => handleStockChange(e.target.value)}
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
                        onChange={(e) => setPermiteExtras(e.target.checked)}
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

          </form>
        </div>

        {/* Footer */}
        <div className="order-modal-footer">
          <div className="order-modal-footer-left">
            {/* Espacio para acciones adicionales */}
          </div>
          <div className="order-modal-footer-right">
            <button
              type="button"
              className="order-modal-btn order-modal-btn-close"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="order-modal-btn order-modal-btn-primary"
              onClick={submit}
              disabled={saving}
            >
              {saving ? 'Guardando…' : '💾 Guardar Stock'}
            </button>
          </div>
        </div>
      </section>

      {/* Modal de referencia de tipos de stock */}
      {showInfoReference && (
        <div className="status-reference-overlay" onClick={() => setShowInfoReference(false)} style={{ zIndex: 10000 }}>
          <div className="status-reference-card" onClick={(e) => e.stopPropagation()}>
            <div className="status-ref-header">
              <h3>Stock Individual vs Stock Compuesto</h3>
              <button className="status-ref-close" onClick={() => setShowInfoReference(false)}>×</button>
            </div>
            <div className="status-ref-body">
              <div className="status-flow">
                <div className="status-flow-split">
                  <div className="status-flow-branch">
                    <span className="branch-label">Stock Individual</span>

                    <div className="status-flow-item">
                      <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                        <Inventory2OutlinedIcon fontSize="small" />
                      </div>
                      <div className="status-flow-info">
                        <span className="status-flow-name">Producto Simple</span>
                        <span className="status-flow-desc">Para productos que vendes por unidad completa</span>
                      </div>
                    </div>

                    <div className="status-flow-item">
                      <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <span style={{ fontSize: '20px' }}>🔢</span>
                      </div>
                      <div className="status-flow-info">
                        <span className="status-flow-name">Cantidad Fija</span>
                        <span className="status-flow-desc">Defines manualmente cuántas unidades tienes</span>
                      </div>
                    </div>

                    <div className="status-flow-item">
                      <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                        <RemoveCircleOutlineOutlinedIcon fontSize="small" />
                      </div>
                      <div className="status-flow-info">
                        <span className="status-flow-name">Control Manual</span>
                        <span className="status-flow-desc">Actualizas el stock manualmente cuando reabasteces</span>
                      </div>
                    </div>

                    <div className="status-ref-note" style={{ marginTop: '12px', background: '#eff6ff', borderColor: '#3b82f6', color: '#1e40af' }}>
                      <strong>Ejemplo:</strong> Camisetas, gorras, artesanías, productos empacados
                    </div>
                  </div>

                  <div className="status-flow-branch">
                    <span className="branch-label">Stock Compuesto</span>

                    <div className="status-flow-item">
                      <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <RestaurantMenuOutlinedIcon fontSize="small" />
                      </div>
                      <div className="status-flow-info">
                        <span className="status-flow-name">Producto Elaborado</span>
                        <span className="status-flow-desc">Para productos que se hacen con ingredientes</span>
                      </div>
                    </div>

                    <div className="status-flow-item">
                      <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                        <span style={{ fontSize: '20px' }}>🍴</span>
                      </div>
                      <div className="status-flow-info">
                        <span className="status-flow-name">Basado en Ingredientes</span>
                        <span className="status-flow-desc">El stock se calcula según ingredientes disponibles</span>
                      </div>
                    </div>

                    <div className="status-flow-item">
                      <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
                        <AddOutlinedIcon fontSize="small" />
                      </div>
                      <div className="status-flow-info">
                        <span className="status-flow-name">Control Automático</span>
                        <span className="status-flow-desc">El sistema descuenta ingredientes automáticamente</span>
                      </div>
                    </div>

                    <div className="status-ref-note" style={{ marginTop: '12px', background: '#fef3c7', borderColor: '#f59e0b', color: '#78350f' }}>
                      <strong>Ejemplo:</strong> Hamburguesas, pizzas, ensaladas, bebidas preparadas
                    </div>
                  </div>
                </div>

                <div className="status-flow-arrow">↓</div>

                <div className="status-flow-item">
                  <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                    <span style={{ fontSize: '20px' }}>✨</span>
                  </div>
                  <div className="status-flow-info">
                    <span className="status-flow-name">Extras Opcionales</span>
                    <span className="status-flow-desc">En productos compuestos, permite que el cliente agregue ingredientes extra con precio adicional</span>
                  </div>
                </div>
              </div>

              <div className="status-ref-footer">
                <div className="status-ref-note">
                  <strong>Consejo:</strong> Usa stock individual para productos terminados y stock compuesto para productos que preparas con ingredientes. Esto te permite un mejor control de inventario y evita vender productos sin ingredientes disponibles.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagementModal;
