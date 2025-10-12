import React, { useState } from 'react';
import { ProductModal, ProductsSkeletonLoader } from './components';
import { useProducts } from './hooks/useProducts';
import { ProductWithExtras } from './types';
import './ProductsSection.css';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ProductRow from './components/ProductCard';
const ProductsSection: React.FC = () => {
  const {
    products,
    loading,
    error,
    stats,
    user,
    loadProducts,
    handleSaveProduct,
    handleDeleteProduct
  } = useProducts();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithExtras | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all'); 
  const filteredProducts = products.filter((product) => {
  const nombre = product.nombre || '';
  const descripcion = product.descripcion || '';
  const searchTermLower = searchTerm.toLowerCase();

  const matchesSearch =
    nombre.toLowerCase().includes(searchTermLower) ||
    descripcion.toLowerCase().includes(searchTermLower);

  // Ojo con null/undefined en activo: normalizalo a boolean
  const isActive = product.activo === true;

  const matchesStatus =
    statusFilter === 'all'
      ? true
      : statusFilter === 'active'
      ? isActive
      : !isActive; 

  return matchesSearch && matchesStatus;
});

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddModal(true);
  };

  
  
  const handleEditProduct = (product: ProductWithExtras) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleSave = async (productData: {
    nombre: string;
    descripcion: string;
    precio: number;
    activo: boolean;
    file?: File;
  }) => {
    try {
      await handleSaveProduct(productData, editingProduct);
      setShowAddModal(false);
      setEditingProduct(null);
    } catch (err: any) {
      alert(err.message || 'Error al guardar producto');
    }
  };

  // Mostrar loading
  if (loading) {
    return <ProductsSkeletonLoader />;
  }

  // Mostrar error
  if (error) {
    return (
      <div className="products-section">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Error al cargar productos</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={loadProducts}>
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
            <span className="sidebar-icon"><Inventory2OutlinedIcon fontSize="small" /></span>
            Productos
          </h2>
        </div>

<div className="sidebar-content">
  <div className="sidebar-section">
    <h3 className="sidebar-section-title">Buscar</h3>
    <div className="sidebar-search">
      <input
        type="text"
        placeholder="Nombre o descripción..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="sidebar-search-input"
      />
      <span className="sidebar-search-icon">🔍</span>
    </div>
  </div>

  <div className="sidebar-section">
    <h3 className="sidebar-section-title">Estado</h3>

    {/* Reutilizamos el patrón "lista vertical" del nav */}
    <div className="cnav-list sidebar-filters">
      {/* Todos */}
      <button
        className={`cnav-item ${statusFilter === 'all' ? 'active' : ''}`}
        onClick={() => setStatusFilter('all')}
        aria-pressed={statusFilter === 'all'}
      >
        <span className="cnav-icon"><FilterListOutlinedIcon fontSize="small" /></span>
        <span className="cnav-label">Todos</span>
        <span className="cnav-pill">{products.length}</span>
      </button>

      {/* Activos */}
      <button
        className={`cnav-item ${statusFilter === 'active' ? 'active' : ''}`}
        onClick={() => setStatusFilter('active')}
        aria-pressed={statusFilter === 'active'}
      >
        <span className="cnav-icon"><CheckCircleOutlineOutlinedIcon fontSize="small" /></span>
        <span className="cnav-label">Activos</span>
        <span className="cnav-pill">{stats.activos}</span>
      </button>

      {/* Inactivos */}
      <button
        className={`cnav-item ${statusFilter === 'inactive' ? 'active' : ''}`}
        onClick={() => setStatusFilter('inactive')}
        aria-pressed={statusFilter === 'inactive'}
      >
        <span className="cnav-icon"><HighlightOffOutlinedIcon fontSize="small" /></span>
        <span className="cnav-label">Inactivos</span>
        <span className="cnav-pill">{stats.inactivos}</span>
      </button>
    </div>
  </div>

  <div className="sidebar-section">
    {/* Botón primario con el mismo patrón del nav */}
    <button className="cnav-item cnav-item--primary" onClick={handleAddProduct}>
      <span className="cnav-icon"><AddOutlinedIcon fontSize="small" /></span>
      <span className="cnav-label">Agregar producto</span>
    </button>
  </div>

  {searchTerm && (
    <div className="sidebar-section">
      {/* Botón sutil para limpiar */}
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
        {/* Header del contenido */}



{/* Lista de productos (formato tabla liviana) */}
<div className="products-list">
  <div className="products-list-header">
    <div className="hcell h-product">Producto</div>
    <div className="hcell h-status">Estado</div>
    <div className="hcell h-price">Precio</div>
    <div className="hcell h-date">Creado</div>
    <div className="hcell h-actions">Acciones</div>
  </div>

  <div className="products-list-body">
    {filteredProducts.map((product) => (
      <ProductRow
        key={product.id}
        product={product}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
    ))}
  </div>
</div>

        {filteredProducts.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No se encontraron productos</h3>
            <p>
              {searchTerm 
                ? `No hay productos que coincidan con "${searchTerm}"`
                : 'No tienes productos registrados aún'
              }
            </p>
            <button className="btn-empty-state" onClick={handleAddProduct}>
              <span className="btn-icon">+</span>
              {searchTerm ? 'Agregar Nuevo Producto' : 'Agregar Primer Producto'}
            </button>
          </div>
        )}
      </div>

      {/* Modal para agregar/editar producto */}
      {showAddModal && (
        <ProductModal
          product={editingProduct}
          user={user}
          onSave={handleSave}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductsSection;
