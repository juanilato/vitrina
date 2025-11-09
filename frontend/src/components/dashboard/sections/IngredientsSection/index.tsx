import React, { useState } from 'react';
import { IngredienteModal, IngredienteRow } from './components';
import { useIngredientes } from './hooks/useIngredientes';
import { IngredienteWithExtras } from './types';
import './IngredientsSection.css';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import LocalGroceryStoreOutlinedIcon from '@mui/icons-material/LocalGroceryStoreOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';

const IngredientesSection: React.FC = () => {
  const {
    ingredientes,
    loading,
    error,
    stats,
    user,
    loadIngredientes,
    handleSaveIngrediente,
    handleDeleteIngrediente
  } = useIngredientes();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIngrediente, setEditingIngrediente] = useState<IngredienteWithExtras | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [showInfoReference, setShowInfoReference] = useState(false); 
  
  const filteredIngredientes = ingredientes.filter((ingrediente) => {
    const nombre = ingrediente.nombre || '';
    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch = nombre.toLowerCase().includes(searchTermLower);

    const stock = ingrediente.stockDisponible ?? 0;
    const isInStock = stock > 0;
    const isLowStock = stock > 0 && stock < 10;
    const isOutOfStock = stock === 0;

    const matchesStock =
      stockFilter === 'all'
        ? true
        : stockFilter === 'in_stock'
        ? isInStock && !isLowStock
        : stockFilter === 'low_stock'
        ? isLowStock
        : isOutOfStock;

    return matchesSearch && matchesStock;
  });

  // Calcular estadísticas
  const stockStats = {
    all: ingredientes.length,
    inStock: ingredientes.filter(i => i.stockDisponible >= 10).length,
    lowStock: ingredientes.filter(i => i.stockDisponible > 0 && i.stockDisponible < 10).length,
    outOfStock: ingredientes.filter(i => i.stockDisponible === 0).length,
  };

  const handleAddIngrediente = () => {
    setEditingIngrediente(null);
    setShowAddModal(true);
  };
  
  const handleEditIngrediente = (ingrediente: IngredienteWithExtras) => {
    setEditingIngrediente(ingrediente);
    setShowAddModal(true);
  };

  const handleSave = async (ingredienteData: {
    nombre: string;
    stockDisponible: number;
    unidadMedida: string;
    icono?: string;
  }) => {
    try {
      await handleSaveIngrediente(ingredienteData, editingIngrediente);
      setShowAddModal(false);
      setEditingIngrediente(null);
    } catch (err: any) {
      alert(err.message || 'Error al guardar ingrediente');
    }
  };

  if (loading) {
    return (
      <div className="products-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando ingredientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-section">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Error al cargar ingredientes</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={loadIngredientes}>
            <span className="btn-icon">🔄</span>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-section">
      {/* Sidebar izquierda */}
      <div className="products-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            <span className="sidebar-icon"><LocalGroceryStoreOutlinedIcon fontSize="small" /></span>
            Inventario
          </h2>
          <button
            className="btn-info-icon"
            onClick={() => setShowInfoReference(!showInfoReference)}
            title="Ver cómo funcionan los ingredientes"
          >
            <InfoOutlinedIcon fontSize="small" />
          </button>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Buscar</h3>
            <div className="sidebar-search">
              <input
                type="text"
                placeholder="Nombre de ingrediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sidebar-search-input"
              />
              <span className="sidebar-search-icon">🔍</span>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Estado de Stock</h3>

            <div className="cnav-list sidebar-filters">
              {/* Todos */}
              <button
                className={`cnav-item ${stockFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStockFilter('all')}
                aria-pressed={stockFilter === 'all'}
              >
                <span className="cnav-icon"><FilterListOutlinedIcon fontSize="small" /></span>
                <span className="cnav-label">Todos</span>
                <span className="cnav-pill">{stockStats.all}</span>
              </button>

              {/* En Stock (buena cantidad) */}
              <button
                className={`cnav-item ${stockFilter === 'in_stock' ? 'active' : ''}`}
                onClick={() => setStockFilter('in_stock')}
                aria-pressed={stockFilter === 'in_stock'}
              >
                <span className="cnav-icon"><CheckCircleOutlineOutlinedIcon fontSize="small" /></span>
                <span className="cnav-label">En Stock</span>
                <span className="cnav-pill">{stockStats.inStock}</span>
              </button>

              {/* Stock Bajo */}
              <button
                className={`cnav-item ${stockFilter === 'low_stock' ? 'active' : ''}`}
                onClick={() => setStockFilter('low_stock')}
                aria-pressed={stockFilter === 'low_stock'}
              >
                <span className="cnav-icon"><WarningAmberOutlinedIcon fontSize="small" /></span>
                <span className="cnav-label">Stock Bajo</span>
                <span className="cnav-pill">{stockStats.lowStock}</span>
              </button>

              {/* Agotados */}
              <button
                className={`cnav-item ${stockFilter === 'out_of_stock' ? 'active' : ''}`}
                onClick={() => setStockFilter('out_of_stock')}
                aria-pressed={stockFilter === 'out_of_stock'}
              >
                <span className="cnav-icon"><HighlightOffOutlinedIcon fontSize="small" /></span>
                <span className="cnav-label">Agotados</span>
                <span className="cnav-pill">{stockStats.outOfStock}</span>
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <button className="cnav-item cnav-item--primary" onClick={handleAddIngrediente}>
              <span className="cnav-icon"><AddOutlinedIcon fontSize="small" /></span>
              <span className="cnav-label">Agregar ingrediente</span>
            </button>
          </div>

          {(searchTerm || stockFilter !== 'all') && (
            <div className="sidebar-section">
              <button
                className="cnav-item cnav-item--subtle"
                onClick={() => {
                  setSearchTerm('');
                  setStockFilter('all');
                }}
              >
                <span className="cnav-icon">🔄</span>
                <span className="cnav-label">Limpiar filtros</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="products-main">
        <div className="products-list">
          <div className="products-list-header">
            <div className="hcell h-product">Ingrediente</div>
            <div className="hcell h-status">Stock</div>
            <div className="hcell h-price" style={{ textAlign: 'left' }}>Cantidad / Unidad</div>
            <div className="hcell h-date">Unidad Medida</div>
            <div className="hcell h-actions">Acciones</div>
          </div>

          <div className="products-list-body">
            {filteredIngredientes.map((ingrediente) => (
              <IngredienteRow
                key={ingrediente.id}
                ingrediente={ingrediente}
                onEdit={handleEditIngrediente}
                onDelete={handleDeleteIngrediente}
              />
            ))}
          </div>
        </div>

        {filteredIngredientes.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h3>No se encontraron ingredientes</h3>
            <p>
              {searchTerm 
                ? `No hay ingredientes que coincidan con "${searchTerm}"`
                : 'No tienes ingredientes registrados aún'
              }
            </p>
            <button className="btn-empty-state" onClick={handleAddIngrediente}>
              <span className="btn-icon">+</span>
              {searchTerm ? 'Agregar Nuevo Ingrediente' : 'Agregar Primer Ingrediente'}
            </button>
          </div>
        )}
      </div>

      {/* Modal para agregar/editar ingrediente */}
      {showAddModal && (
        <IngredienteModal
          ingrediente={editingIngrediente}
          user={user}
          onSave={handleSave}
          onClose={() => {
            setShowAddModal(false);
            setEditingIngrediente(null);
          }}
        />
      )}

      {/* Modal de referencia de ingredientes */}
      {showInfoReference && (
        <div className="status-reference-overlay" onClick={() => setShowInfoReference(false)}>
          <div className="status-reference-card" onClick={(e) => e.stopPropagation()}>
            <div className="status-ref-header">
              <h3>¿Cómo funcionan los Ingredientes?</h3>
              <button className="status-ref-close" onClick={() => setShowInfoReference(false)}>×</button>
            </div>
            <div className="status-ref-body">
              <div className="status-flow">
                <div className="status-flow-item">
                  <div className="status-flow-icon pending" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <AddOutlinedIcon fontSize="small" />
                  </div>
                  <div className="status-flow-info">
                    <span className="status-flow-name">1. Crear Ingrediente</span>
                    <span className="status-flow-desc">Registra ingredientes con nombre, stock y unidad de medida</span>
                  </div>
                </div>
                <div className="status-flow-arrow">↓</div>

                <div className="status-flow-item">
                  <div className="status-flow-icon confirmed" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                    <Inventory2OutlinedIcon fontSize="small" />
                  </div>
                  <div className="status-flow-info">
                    <span className="status-flow-name">2. Gestionar Stock</span>
                    <span className="status-flow-desc">Controla el stock disponible de cada ingrediente</span>
                  </div>
                </div>
                <div className="status-flow-arrow">↓</div>

                <div className="status-flow-item">
                  <div className="status-flow-icon processing" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                    <RestaurantMenuOutlinedIcon fontSize="small" />
                  </div>
                  <div className="status-flow-info">
                    <span className="status-flow-name">3. Usar en Productos</span>
                    <span className="status-flow-desc">Asigna ingredientes a productos compuestos</span>
                  </div>
                </div>
                <div className="status-flow-arrow">↓</div>

                <div className="status-flow-split">
                  <div className="status-flow-branch">
                    <span className="branch-label">Stock Automático</span>
                    <div className="status-flow-item">
                      <div className="status-flow-icon waiting-delivery" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </div>
                      <div className="status-flow-info">
                        <span className="status-flow-name">Descuenta al Vender</span>
                        <span className="status-flow-desc">El stock se reduce automáticamente con cada pedido</span>
                      </div>
                    </div>
                  </div>

                  <div className="status-flow-branch">
                    <span className="branch-label">Extras Opcionales</span>
                    <div className="status-flow-item">
                      <div className="status-flow-icon on-way" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <AddOutlinedIcon fontSize="small" />
                      </div>
                      <div className="status-flow-info">
                        <span className="status-flow-name">Ingredientes Extra</span>
                        <span className="status-flow-desc">Permite al cliente agregar extras con precio adicional</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="status-flow-arrow">↓</div>

                <div className="status-flow-item">
                  <div className="status-flow-icon delivered" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
                    <WarningAmberOutlinedIcon fontSize="small" />
                  </div>
                  <div className="status-flow-info">
                    <span className="status-flow-name">4. Alertas de Stock</span>
                    <span className="status-flow-desc">Recibe notificaciones cuando el stock está bajo o agotado</span>
                  </div>
                </div>
              </div>

              <div className="status-ref-footer">
                <div className="status-ref-note">
                  <strong>Nota:</strong> Los ingredientes son esenciales para productos compuestos. Asegúrate de mantener stock suficiente para evitar quedarte sin disponibilidad.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientesSection;