// src/features/ingredientes/IngredientesSection/index.tsx (Nuevo Archivo)

import React, { useState } from 'react';
import { IngredienteModal, IngredienteRow } from './components'; // Asume que creas este index
import { useIngredientes } from './hooks/useIngredientes';
import { IngredienteWithExtras } from './types';
// Reutilizamos los estilos de la sección de productos
import './IngredientsSection.css'; 

// Importa iconos relevantes para ingredientes
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import LocalGroceryStoreOutlinedIcon from '@mui/icons-material/LocalGroceryStoreOutlined'; // Icono principal
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';


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
  // Filtro adaptado: 'all', 'in_stock', 'out_of_stock'
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all'); 
  
  const filteredIngredientes = ingredientes.filter((ingrediente) => {
    const nombre = ingrediente.nombre || '';
    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch = nombre.toLowerCase().includes(searchTermLower);

    const isInStock = ingrediente.stockDisponible > 0;

    const matchesStock =
      stockFilter === 'all'
        ? true
        : stockFilter === 'in_stock'
        ? isInStock
        : !isInStock; 

    return matchesSearch && matchesStock;
  });

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
    // Reutilizar el ProductsSkeletonLoader (no provisto, pero asumimos que funciona)
    return <div>Cargando ingredientes...</div>; 
  }

  if (error) {
    return (
      <div className="products-section">
        {/* Error state (reutilizando clases) */}
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
                <span className="cnav-pill">{ingredientes.length}</span>
              </button>

              {/* En Stock */}
              <button
                className={`cnav-item ${stockFilter === 'in_stock' ? 'active' : ''}`}
                onClick={() => setStockFilter('in_stock')}
                aria-pressed={stockFilter === 'in_stock'}
              >
                <span className="cnav-icon"><CheckCircleOutlineOutlinedIcon fontSize="small" /></span>
                <span className="cnav-label">En Stock</span>
                <span className="cnav-pill">
                  {ingredientes.filter(i => i.stockDisponible > 0).length}
                </span>
              </button>

              {/* Agotados */}
              <button
                className={`cnav-item ${stockFilter === 'out_of_stock' ? 'active' : ''}`}
                onClick={() => setStockFilter('out_of_stock')}
                aria-pressed={stockFilter === 'out_of_stock'}
              >
                <span className="cnav-icon"><HighlightOffOutlinedIcon fontSize="small" /></span>
                <span className="cnav-label">Agotados</span>
                <span className="cnav-pill">
                  {ingredientes.filter(i => i.stockDisponible === 0).length}
                </span>
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <button className="cnav-item cnav-item--primary" onClick={handleAddIngrediente}>
              <span className="cnav-icon"><AddOutlinedIcon fontSize="small" /></span>
              <span className="cnav-label">Agregar ingrediente</span>
            </button>
          </div>

          {searchTerm && (
            <div className="sidebar-section">
              <button
                className="cnav-item cnav-item--subtle"
                onClick={() => setSearchTerm('')}
              >
                <span className="cnav-icon">🔄</span>
                <span className="cnav-label">Limpiar búsqueda</span>
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
    </div>
  );
};

export default IngredientesSection;