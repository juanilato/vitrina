import React, { useState } from 'react';
import { OrderCard, OrderModal, OrdersSkeletonLoader } from './components';
import { useOrders } from './hooks/useOrders';
import { PedidoWithDetails } from './types';
import './OrdersSection.css';

const OrdersSection: React.FC = () => {
  const {
    orders,
    loading,
    error,
    stats,
    loadOrders,
    handleUpdateOrderStatus,
    handleDeleteOrder,
    getFilteredOrders
  } = useOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedOrder, setSelectedOrder] = useState<PedidoWithDetails | null>(null);

  const filteredOrders = getFilteredOrders(searchTerm, statusFilter);

  const handleViewDetails = (pedido: PedidoWithDetails) => {
    setSelectedOrder(pedido);
  };

  const handleStatusUpdate = async (pedidoId: string, newStatus: 'pendiente' | 'en_proceso' | 'finalizado') => {
    try {
      await handleUpdateOrderStatus(pedidoId, newStatus);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el estado del pedido');
    }
  };

  // Mostrar loading
  if (loading) {
    return <OrdersSkeletonLoader />;
  }

  // Mostrar error
  if (error) {
    return (
      <div className="orders-section">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Error al cargar pedidos</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={loadOrders}>
            <span className="btn-icon">🔄</span>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-section">
      {/* Sidebar izquierda */}
      <div className="orders-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            <span className="sidebar-icon">📋</span>
            Pedidos
          </h2>
        </div>

        {/* Filtros y búsqueda */}
        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Buscar</h3>
            <div className="sidebar-search">
              <input
                type="text"
                placeholder="Cliente, email o ID..."
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
                className={`sidebar-filter-btn ${statusFilter === 'todos' ? 'active' : ''}`}
                onClick={() => setStatusFilter('todos')}
              >
                <span className="filter-icon">📊</span>
                Todos ({orders.length})
              </button>
              <button
                className={`sidebar-filter-btn ${statusFilter === 'pendiente' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pendiente')}
              >
                <span className="filter-icon" style={{ color: '#f59e0b' }}>⏳</span>
                Pendientes ({stats.pendientes})
              </button>
              <button
                className={`sidebar-filter-btn ${statusFilter === 'en_proceso' ? 'active' : ''}`}
                onClick={() => setStatusFilter('en_proceso')}
              >
                <span className="filter-icon" style={{ color: '#3b82f6' }}>⚙️</span>
                En Proceso ({stats.enProceso})
              </button>
              <button
                className={`sidebar-filter-btn ${statusFilter === 'finalizado' ? 'active' : ''}`}
                onClick={() => setStatusFilter('finalizado')}
              >
                <span className="filter-icon" style={{ color: '#10b981' }}>✅</span>
                Finalizados ({stats.finalizados})
              </button>
            </div>
          </div>

          {(searchTerm || statusFilter !== 'todos') && (
            <div className="sidebar-section">
              <button 
                className="sidebar-clear-btn"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('todos');
                }}
              >
                <span className="btn-icon">🔄</span>
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="orders-main">
        {/* Header del contenido */}
        <div className="orders-main-header">
          <h1 className="main-title">Gestión de Pedidos</h1>
          <p className="main-subtitle">
            Mostrando {filteredOrders.length} de {orders.length} pedidos
          </p>
        </div>

        {/* Lista de pedidos */}
        <div className="orders-grid">
        {filteredOrders.map(order => (
          <OrderCard
            key={order.id}
            pedido={order}
            onUpdateStatus={handleStatusUpdate}
            onViewDetails={handleViewDetails}
            onDelete={handleDeleteOrder}
          />
        ))}
      </div>

        {filteredOrders.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No se encontraron pedidos</h3>
            <p>
              {searchTerm || statusFilter !== 'todos'
                ? 'No hay pedidos que coincidan con los filtros aplicados'
                : 'No tienes pedidos registrados aún'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de detalles del pedido */}
      {selectedOrder && (
        <OrderModal
          pedido={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default OrdersSection;
