import React, { useState, useEffect } from 'react';
import { useAuthOptimized } from '../../../../../hooks/useAuthOptimized';
import productosService from '../../../../../services/productosService';
import ingredientesService from '../../../../../services/ingredientesService';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import '../../ProductsSection/ProductsSection.css';

interface StockControlModalProps {
  onClose: () => void;
  onUpdate: () => void;
}

interface ProductWithStock {
  id: string;
  nombre: string;
  stockIndividual: number;
  tipoStock: string;
  imagenUrl?: string;
}

interface IngredientWithStock {
  id: string;
  nombre: string;
  stockDisponible: number;
  unidadMedida: string;
  icono?: string;
}

const StockControlModal: React.FC<StockControlModalProps> = ({ onClose, onUpdate }) => {
  const { user } = useAuthOptimized();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInfoReference, setShowInfoReference] = useState(false);

  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [ingredients, setIngredients] = useState<IngredientWithStock[]>([]);

  // Estados para los inputs de stock
  const [productStockInputs, setProductStockInputs] = useState<{ [key: string]: string }>({});
  const [ingredientStockInputs, setIngredientStockInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, [user?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Cargar productos y ingredientes en paralelo
      const [productosData, ingredientesData] = await Promise.all([
        productosService.getProductosByEmpresa(user.id),
        ingredientesService.getIngredientesByEmpresa(user.id)
      ]);

      // Filtrar solo productos con stock individual y mapear para asegurar stockIndividual válido
      const productsWithIndividualStock = Array.isArray(productosData)
        ? productosData
            .filter((p: any) => p.tipoStock === 'individual')
            .map((p: any) => ({
              id: p.id,
              nombre: p.nombre,
              stockIndividual: p.stockIndividual ?? 0,
              tipoStock: p.tipoStock,
              imagenUrl: p.imagenUrl
            }))
        : [];

      setProducts(productsWithIndividualStock);
      setIngredients(Array.isArray(ingredientesData) ? ingredientesData : []);

    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      alert('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductStockChange = (productId: string, value: string) => {
    // Solo permitir números
    if (/^\d*$/.test(value)) {
      setProductStockInputs(prev => ({ ...prev, [productId]: value }));
    }
  };

  const handleIngredientStockChange = (ingredientId: string, value: string) => {
    // Permitir números decimales
    if (/^\d*\.?\d*$/.test(value)) {
      setIngredientStockInputs(prev => ({ ...prev, [ingredientId]: value }));
    }
  };

  const addProductStock = (productId: string) => {
    const currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;

    const inputValue = productStockInputs[productId] || '0';
    const valueToAdd = parseInt(inputValue, 10) || 0;

    if (valueToAdd <= 0) {
      alert('Ingresa una cantidad válida mayor a 0');
      return;
    }

    const newStock = currentProduct.stockIndividual + valueToAdd;

    setProducts(prev =>
      prev.map(p => p.id === productId ? { ...p, stockIndividual: newStock } : p)
    );

    // Limpiar el input
    setProductStockInputs(prev => ({ ...prev, [productId]: '' }));
  };

  const addIngredientStock = (ingredientId: string) => {
    const currentIngredient = ingredients.find(i => i.id === ingredientId);
    if (!currentIngredient) return;

    const inputValue = ingredientStockInputs[ingredientId] || '0';
    const valueToAdd = parseFloat(inputValue) || 0;

    if (valueToAdd <= 0) {
      alert('Ingresa una cantidad válida mayor a 0');
      return;
    }

    const newStock = currentIngredient.stockDisponible + valueToAdd;

    setIngredients(prev =>
      prev.map(i => i.id === ingredientId ? { ...i, stockDisponible: newStock } : i)
    );

    // Limpiar el input
    setIngredientStockInputs(prev => ({ ...prev, [ingredientId]: '' }));
  };

  const handleSaveAll = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);

      // Actualizar productos modificados
      const productUpdates = products.map(product =>
        productosService.updateProducto(product.id, {
          stockIndividual: product.stockIndividual
        })
      );

      // Actualizar ingredientes modificados
      const ingredientUpdates = ingredients.map(ingredient =>
        ingredientesService.updateIngrediente(ingredient.id, {
          stockDisponible: ingredient.stockDisponible
        })
      );

      await Promise.all([...productUpdates, ...ingredientUpdates]);

      alert('✅ Stock actualizado correctamente');
      onUpdate();
      onClose();

    } catch (err: any) {
      console.error('Error al guardar:', err);
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStockChipInfo = (stock: number, isIngredient: boolean = false) => {
    if (stock === 0) return { label: 'Sin stock', color: '#dc2626', bg: '#fef2f2' };
    if (!isIngredient && stock < 10) return { label: 'Stock bajo', color: '#f59e0b', bg: '#fef3c7' };
    if (isIngredient && stock < 10) return { label: 'Stock bajo', color: '#f59e0b', bg: '#fef3c7' };
    return { label: 'Stock disponible', color: '#10b981', bg: '#d1fae5' };
  };

  return (
    <div className="pm2-overlay" onClick={onClose}>
      <section
        className="pm2-dialog order-modal-modern"
        role="dialog"
        aria-modal="true"
        aria-label="Control de Stock"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '900px' }}
      >
        {/* Header */}
        <header className="order-modal-header">
          <div className="order-modal-header-left">
            <div className="order-modal-header-info">
              <div className="order-modal-client-name">📦 Control de Stock</div>
              <div className="order-modal-date">Gestiona el stock de productos e ingredientes</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn-info-icon"
              onClick={() => setShowInfoReference(!showInfoReference)}
              title="Ver información sobre control de stock"
              style={{ width: '36px', height: '36px' }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </button>
            <button className="modal-close-modern" onClick={onClose} aria-label="Cerrar">×</button>
          </div>
        </header>

        {/* Body */}
        <div className="order-modal-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
              <p>Cargando datos...</p>
            </div>
          ) : (
            <>
              {/* Sección de Productos */}
              <div className="order-modal-section">
                <h3 className="modal-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Inventory2OutlinedIcon fontSize="small" />
                  Productos con Stock Individual
                </h3>

                {products.length === 0 ? (
                  <p className="pm2-empty-message">No hay productos con stock individual</p>
                ) : (
                  <div className="order-modal-items-list">
                    {products.map(product => {
                      const chipInfo = getStockChipInfo(product.stockIndividual);
                      const inputValue = productStockInputs[product.id] || '';

                      return (
                        <div key={product.id} className="order-modal-item-row">
                          <div className="order-modal-item-info" style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {product.imagenUrl ? (
                                <img
                                  src={product.imagenUrl}
                                  alt={product.nombre}
                                  style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '8px',
                                    objectFit: 'cover'
                                  }}
                                />
                              ) : (
                                <div style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '8px',
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '24px'
                                }}>
                                  📦
                                </div>
                              )}

                              <div style={{ flex: 1 }}>
                                <div className="order-modal-item-name">{product.nombre}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                  <span
                                    className="order-chip"
                                    style={{
                                      backgroundColor: chipInfo.bg,
                                      color: chipInfo.color,
                                      borderColor: chipInfo.color,
                                      fontSize: '11px',
                                      padding: '4px 8px'
                                    }}
                                  >
                                    {chipInfo.label}
                                  </span>
                                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                    {product.stockIndividual} unidades
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="pm2-input-wrapper" style={{ margin: 0, minWidth: '100px' }}>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={inputValue}
                                onChange={(e) => handleProductStockChange(product.id, e.target.value)}
                                placeholder="Cantidad"
                                className="pm2-input-modern"
                                style={{ padding: '8px 12px', fontSize: '14px' }}
                              />
                            </div>
                            <button
                              type="button"
                              className="order-modal-btn order-modal-btn-primary"
                              onClick={() => addProductStock(product.id)}
                              disabled={!inputValue || parseInt(inputValue) <= 0}
                              style={{ padding: '8px 16px', minWidth: 'auto' }}
                            >
                              <AddOutlinedIcon fontSize="small" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sección de Ingredientes */}
              <div className="order-modal-section" style={{ marginTop: '24px' }}>
                <h3 className="modal-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RestaurantMenuOutlinedIcon fontSize="small" />
                  Ingredientes
                </h3>

                {ingredients.length === 0 ? (
                  <p className="pm2-empty-message">No hay ingredientes registrados</p>
                ) : (
                  <div className="order-modal-items-list">
                    {ingredients.map(ingredient => {
                      const chipInfo = getStockChipInfo(ingredient.stockDisponible, true);
                      const inputValue = ingredientStockInputs[ingredient.id] || '';

                      return (
                        <div key={ingredient.id} className="order-modal-item-row">
                          <div className="order-modal-item-info" style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '36px' }}>{ingredient.icono || '🍴'}</span>

                              <div style={{ flex: 1 }}>
                                <div className="order-modal-item-name">{ingredient.nombre}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                  <span
                                    className="order-chip"
                                    style={{
                                      backgroundColor: chipInfo.bg,
                                      color: chipInfo.color,
                                      borderColor: chipInfo.color,
                                      fontSize: '11px',
                                      padding: '4px 8px'
                                    }}
                                  >
                                    {chipInfo.label}
                                  </span>
                                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                    {ingredient.stockDisponible} {ingredient.unidadMedida}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="pm2-input-wrapper" style={{ margin: 0, minWidth: '100px' }}>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={inputValue}
                                onChange={(e) => handleIngredientStockChange(ingredient.id, e.target.value)}
                                placeholder="Cantidad"
                                className="pm2-input-modern"
                                style={{ padding: '8px 12px', fontSize: '14px' }}
                              />
                              <span className="pm2-input-hint" style={{ fontSize: '11px' }}>
                                {ingredient.unidadMedida}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="order-modal-btn order-modal-btn-primary"
                              onClick={() => addIngredientStock(ingredient.id)}
                              disabled={!inputValue || parseFloat(inputValue) <= 0}
                              style={{ padding: '8px 16px', minWidth: 'auto' }}
                            >
                              <AddOutlinedIcon fontSize="small" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="order-modal-footer">
          <div className="order-modal-footer-left">
            <div className="order-modal-chips-section">
              <div className="order-chip order-chip-email">
                📦 {products.length} productos
              </div>
              <div className="order-chip order-chip-delivery">
                🍴 {ingredients.length} ingredientes
              </div>
            </div>
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
              onClick={handleSaveAll}
              disabled={saving || loading}
            >
              {saving ? 'Guardando…' : '💾 Guardar Cambios'}
            </button>
          </div>
        </div>
      </section>

      {/* Modal de información */}
      {showInfoReference && (
        <div className="status-reference-overlay" onClick={() => setShowInfoReference(false)} style={{ zIndex: 10000 }}>
          <div className="status-reference-card" onClick={(e) => e.stopPropagation()}>
            <div className="status-ref-header">
              <h3>Control de Stock</h3>
              <button className="status-ref-close" onClick={() => setShowInfoReference(false)}>×</button>
            </div>
            <div className="status-ref-body">
              <div className="status-flow">
                <div className="status-flow-item">
                  <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                    <Inventory2OutlinedIcon fontSize="small" />
                  </div>
                  <div className="status-flow-info">
                    <span className="status-flow-name">1. Productos con Stock Individual</span>
                    <span className="status-flow-desc">Aquí se muestran solo los productos que tienen control de stock individual (no compuestos)</span>
                  </div>
                </div>
                <div className="status-flow-arrow">↓</div>

                <div className="status-flow-item">
                  <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <RestaurantMenuOutlinedIcon fontSize="small" />
                  </div>
                  <div className="status-flow-info">
                    <span className="status-flow-name">2. Ingredientes</span>
                    <span className="status-flow-desc">Todos los ingredientes registrados para gestionar su stock</span>
                  </div>
                </div>
                <div className="status-flow-arrow">↓</div>

                <div className="status-flow-item">
                  <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                    <AddOutlinedIcon fontSize="small" />
                  </div>
                  <div className="status-flow-info">
                    <span className="status-flow-name">3. Agregar Stock</span>
                    <span className="status-flow-desc">Ingresa la cantidad a agregar y presiona el botón +. El stock se sumará al existente</span>
                  </div>
                </div>
                <div className="status-flow-arrow">↓</div>

                <div className="status-flow-item">
                  <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
                    <span style={{ fontSize: '20px' }}>💾</span>
                  </div>
                  <div className="status-flow-info">
                    <span className="status-flow-name">4. Guardar Cambios</span>
                    <span className="status-flow-desc">Al finalizar, presiona "Guardar Cambios" para aplicar todas las actualizaciones</span>
                  </div>
                </div>
              </div>

              <div className="status-ref-footer">
                <div className="status-ref-note">
                  <strong>Nota:</strong> Los cambios solo se aplicarán cuando presiones el botón "Guardar Cambios". Puedes agregar stock a múltiples productos e ingredientes antes de guardar.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockControlModal;
