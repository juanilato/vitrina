import React, { useState } from 'react';
import { ProductModal, ProductCard, ProductsSkeletonLoader } from './components';
import { useProducts } from './hooks/useProducts';
import { ProductWithExtras } from './types';
import './ProductsSection.css';

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
            <span className="sidebar-icon">📦</span>
            Productos
          </h2>
        </div>

        {/* Filtros y búsqueda */}
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
          <div className="sidebar-filters">
  <button
    className={`sidebar-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
    onClick={() => setStatusFilter('all')}
    aria-pressed={statusFilter === 'all'}
  >
    <span className="filter-icon">📊</span>
    Todos ({products.length})
  </button>

  <button
    className={`sidebar-filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
    onClick={() => setStatusFilter('active')}
    aria-pressed={statusFilter === 'active'}
  >
    <span className="filter-icon" style={{ color: '#10b981' }}>✅</span>
    Activos ({stats.activos})
  </button>

  <button
    className={`sidebar-filter-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
    onClick={() => setStatusFilter('inactive')}
    aria-pressed={statusFilter === 'inactive'}
  >
    <span className="filter-icon" style={{ color: '#ef4444' }}>❌</span>
    Inactivos ({stats.inactivos})
  </button>
</div>
          </div>

          <div className="sidebar-section">
            <button 
              className="sidebar-add-btn"
              onClick={handleAddProduct}
            >
              <span className="btn-icon">+</span>
              Agregar Producto
            </button>
          </div>

          {searchTerm && (
            <div className="sidebar-section">
              <button 
                className="sidebar-clear-btn"
                onClick={() => setSearchTerm('')}
              >
                <span className="btn-icon">🔄</span>
                Limpiar Búsqueda
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="products-main">
        {/* Header del contenido */}
        <div className="products-main-header">
          <h1 className="main-title">Gestión de Productos</h1>
          <p className="main-subtitle">
            Mostrando {filteredProducts.length} de {products.length} productos
          </p>
        </div>

        {/* Lista de productos */}
        <div className="products-grid">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        ))}
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
