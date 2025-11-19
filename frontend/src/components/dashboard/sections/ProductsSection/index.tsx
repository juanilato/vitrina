import React, { useState } from 'react';
import { ProductModal, ProductsSkeletonLoader } from './components';
import StockManagementModal from './components/StockManagementModal';
import CategoryManager from './components/CategoryManager';
import { useProducts } from './hooks/useProducts';
import { ProductWithExtras } from './types';
import './ProductsSection.css';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ProductRow from './components/ProductCard';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';

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
  const [showStockModal, setShowStockModal] = useState(false);
  const [managingStockProduct, setManagingStockProduct] = useState<ProductWithExtras | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showInfoReference, setShowInfoReference] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false); 
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

  const handleManageStock = (product: ProductWithExtras) => {
    setManagingStockProduct(product);
    setShowStockModal(true);
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

  const handleSaveStock = async (stockData: {
    tipoStock: string;
    stockIndividual?: number;
    permiteExtras: boolean;
    ingredientes?: any[];
  }) => {
    try {
      if (!managingStockProduct) return;

      await handleSaveProduct(
        {
          nombre: managingStockProduct.nombre,
          descripcion: managingStockProduct.descripcion || '',
          precio: managingStockProduct.precio,
          activo: managingStockProduct.activo ?? true,
          ...stockData
        },
        managingStockProduct
      );

      setShowStockModal(false);
      setManagingStockProduct(null);
    } catch (err: any) {
      alert(err.message || 'Error al guardar stock');
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
          <button
            className="btn-info-icon"
            onClick={() => setShowInfoReference(!showInfoReference)}
            title="Ver cómo funcionan los productos"
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

    {/* Botón para gestionar categorías */}
    <button className="cnav-item" onClick={() => setShowCategoryManager(true)}>
      <span className="cnav-icon"><CategoryOutlinedIcon fontSize="small" /></span>
      <span className="cnav-label">Gestionar categorías</span>
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
        onManageStock={handleManageStock}
      />
    ))}
  </div>
</div>

        {filteredProducts.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon-wrapper">
              <div className="empty-state-icon">📦</div>
            </div>
            <h3 className="empty-state-title">No se encontraron productos</h3>
            <p className="empty-state-description">
              {searchTerm
                ? `No hay productos que coincidan con "${searchTerm}"`
                : 'Comienza agregando productos para que tus clientes puedan realizar pedidos desde tu vitrina.'
              }
            </p>
            <button className="btn-empty-state" onClick={handleAddProduct}>
              <AddOutlinedIcon fontSize="small" />
              <span>{searchTerm ? 'Agregar Nuevo Producto' : 'Agregar Primer Producto'}</span>
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

      {/* Modal para gestión de stock */}
      {showStockModal && managingStockProduct && (
        <StockManagementModal
          product={managingStockProduct}
          onSave={handleSaveStock}
          onClose={() => {
            setShowStockModal(false);
            setManagingStockProduct(null);
          }}
        />
      )}

      {/* Modal para gestionar categorías */}
      {showCategoryManager && user && (
        <CategoryManager
          empresaId={user.id}
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      {/* Modal de referencia de productos */}
      {showInfoReference && (
        <div className="status-reference-overlay" onClick={() => setShowInfoReference(false)}>
          <div className="status-reference-card" onClick={(e) => e.stopPropagation()}>
            <div className="status-ref-header">
              <h3>¿Cómo funcionan los Productos?</h3>
              <button className="status-ref-close" onClick={() => setShowInfoReference(false)}>×</button>
            </div>
            <div className="status-ref-body">
              <div className="status-flow">
                <div className="status-flow-item">
                  <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <AddOutlinedIcon fontSize="small" />
                  </div>
                  <div className="status-flow-info">
                    <span className="status-flow-name">1. Crear Producto</span>
                    <span className="status-flow-desc">Registra productos con nombre, descripción, precio e imagen</span>
                  </div>
                </div>
                <div className="status-flow-arrow">↓</div>

                <div className="status-flow-item">
                  <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                    <EditOutlinedIcon fontSize="small" />
                  </div>
                  <div className="status-flow-info">
                    <span className="status-flow-name">2. Configurar Información</span>
                    <span className="status-flow-desc">Define precio, descripción y activa/desactiva su disponibilidad</span>
                  </div>
                </div>
                <div className="status-flow-arrow">↓</div>

                <div className="status-flow-item">
                  <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                    <Inventory2OutlinedIcon fontSize="small" />
                  </div>
                  <div className="status-flow-info">
                    <span className="status-flow-name">3. Gestionar Stock</span>
                    <span className="status-flow-desc">Elige entre stock individual o compuesto por ingredientes</span>
                  </div>
                </div>
                <div className="status-flow-arrow">↓</div>

                <div className="status-flow-split">
                  <div className="status-flow-branch">
                    <span className="branch-label">Stock Individual</span>
                    <div className="status-flow-item">
                      <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                        <span style={{ fontSize: '20px' }}>🔢</span>
                      </div>
                      <div className="status-flow-info">
                        <span className="status-flow-name">Cantidad Fija</span>
                        <span className="status-flow-desc">Define cuántas unidades tienes disponibles</span>
                      </div>
                    </div>
                  </div>

                  <div className="status-flow-branch">
                    <span className="branch-label">Stock Compuesto</span>
                    <div className="status-flow-item">
                      <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <span style={{ fontSize: '20px' }}>🍴</span>
                      </div>
                      <div className="status-flow-info">
                        <span className="status-flow-name">Por Ingredientes</span>
                        <span className="status-flow-desc">El stock se calcula según ingredientes disponibles</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="status-flow-arrow">↓</div>

                <div className="status-flow-item">
                  <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
                    <VisibilityOutlinedIcon fontSize="small" />
                  </div>
                  <div className="status-flow-info">
                    <span className="status-flow-name">4. Publicar en Vitrina</span>
                    <span className="status-flow-desc">Los productos activos aparecen en tu tienda online</span>
                  </div>
                </div>
                <div className="status-flow-arrow">↓</div>

                <div className="status-flow-item">
                  <div className="status-flow-icon" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                    <ShoppingCartOutlinedIcon fontSize="small" />
                  </div>
                  <div className="status-flow-info">
                    <span className="status-flow-name">5. Recibir Pedidos</span>
                    <span className="status-flow-desc">Los clientes pueden comprar y el stock se actualiza automáticamente</span>
                  </div>
                </div>
              </div>

              <div className="status-ref-footer">
                <div className="status-ref-note">
                  <strong>Nota:</strong> Los productos con stock compuesto dependen de tus ingredientes. Si un ingrediente se agota, el producto dejará de estar disponible automáticamente.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsSection;
