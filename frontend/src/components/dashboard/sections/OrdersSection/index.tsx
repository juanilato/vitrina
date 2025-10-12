import React, { useState } from 'react';
import { OrderModal, OrdersSkeletonLoader } from './components';
import { useOrders } from './hooks/useOrders';
import { PedidoWithDetails } from './types';
import './OrdersSection.css';
import OrderRow from './components/OrderCard';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import '../../shared/CompanyNavbar.css'; 
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
const OrdersSection: React.FC = () => {
  const {
    orders,
    loading,
    error,
    stats,
    loadOrders,
    handleUpdateOrderStatus,
    handleRejectOrder,
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

  const handleStatusUpdate = async (pedidoId: string, newStatus: 'pendiente_confirmacion' | 'confirmado' | 'en_proceso' |  'esperando_delivery' | 'en_camino' | 'entregado' | 'esperando_retiro') => {
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
            <span className="sidebar-icon"><ReceiptLongOutlinedIcon /></span>
            Pedidos
          </h2>
        </div>

        {/* Filtros y búsqueda */}
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

  <div className="sidebar-filters cnav-list">
    <button
      className={`cnav-item ${statusFilter === 'todos' ? 'active' : ''}`}
      onClick={() => setStatusFilter('todos')}
      aria-pressed={statusFilter === 'todos'}
    >
      <span className="cnav-icon"><FilterListOutlinedIcon fontSize="small" /></span>
      <span className="cnav-label">Todos</span>
      <span className="cnav-pill">{orders.length}</span>
    </button>

    <button
      className={`cnav-item ${statusFilter === 'pendiente_confirmacion' ? 'active' : ''}`}
      onClick={() => setStatusFilter('pendiente_confirmacion')}
      aria-pressed={statusFilter === 'pendiente_confirmacion'}
    >
      <span className="cnav-icon"><HourglassEmptyOutlinedIcon fontSize="small" /></span>
      <span className="cnav-label">Pend. de Confirmación</span>
      <span className="cnav-pill">{stats.pendientesConfirmacion}</span>
    </button>

    <button
      className={`cnav-item ${statusFilter === 'confirmado' ? 'active' : ''}`}
      onClick={() => setStatusFilter('confirmado')}
      aria-pressed={statusFilter === 'confirmado'}
    >
      <span className="cnav-icon"><TaskAltOutlinedIcon fontSize="small" /></span>
      <span className="cnav-label">Confirmados</span>
      <span className="cnav-pill">{stats.confirmados}</span>
    </button>

    <button
      className={`cnav-item ${statusFilter === 'no_confirmado' ? 'active' : ''}`}
      onClick={() => setStatusFilter('no_confirmado')}
      aria-pressed={statusFilter === 'no_confirmado'}
    >
      <span className="cnav-icon"><CancelOutlinedIcon fontSize="small" /></span>
      <span className="cnav-label">No Confirmados</span>
      <span className="cnav-pill">{stats.noConfirmados}</span>
    </button>

    <button
      className={`cnav-item ${statusFilter === 'en_proceso' ? 'active' : ''}`}
      onClick={() => setStatusFilter('en_proceso')}
      aria-pressed={statusFilter === 'en_proceso'}
    >
      <span className="cnav-icon"><SettingsOutlinedIcon fontSize="small" /></span>
      <span className="cnav-label">En Proceso</span>
      <span className="cnav-pill">{stats.enProceso}</span>
    </button>

    <button
      className={`cnav-item ${statusFilter === 'esperando_delivery' ? 'active' : ''}`}
      onClick={() => setStatusFilter('esperando_delivery')}
      aria-pressed={statusFilter === 'esperando_delivery'}
    >
      <span className="cnav-icon"><DeliveryDiningOutlinedIcon fontSize="small" /></span>
      <span className="cnav-label">Esperando Delivery</span>
      <span className="cnav-pill">{stats.esperandoDelivery}</span>
    </button>

    <button
      className={`cnav-item ${statusFilter === 'en_camino' ? 'active' : ''}`}
      onClick={() => setStatusFilter('en_camino')}
      aria-pressed={statusFilter === 'en_camino'}
    >
      <span className="cnav-icon"><NearMeOutlinedIcon fontSize="small" /></span>
      <span className="cnav-label">En Camino</span>
      <span className="cnav-pill">{stats.enCamino}</span>
    </button>

    <button
      className={`cnav-item ${statusFilter === 'esperando_retiro' ? 'active' : ''}`}
      onClick={() => setStatusFilter('esperando_retiro')}
      aria-pressed={statusFilter === 'esperando_retiro'}
    >
      <span className="cnav-icon"><StorefrontOutlinedIcon fontSize="small" /></span>
      <span className="cnav-label">Esperando Retiro</span>
      <span className="cnav-pill">{stats.esperandoRetiro}</span>
    </button>

    <button
      className={`cnav-item ${statusFilter === 'entregado' ? 'active' : ''}`}
      onClick={() => setStatusFilter('entregado')}
      aria-pressed={statusFilter === 'entregado'}
    >
      <span className="cnav-icon"><DoneAllOutlinedIcon fontSize="small" /></span>
      <span className="cnav-label">Entregados</span>
      <span className="cnav-pill">{stats.entregados}</span>
    </button>
  </div>
</div>

  {(searchTerm || statusFilter !== 'todos') && (
    <div className="sidebar-section">
      <button
        className="cnav-item cnav-item--subtle"
        onClick={() => {
          setSearchTerm('');
          setStatusFilter('todos');
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
<div className="orders-main">


  {/* Header tabla (variante Clean bar) */}
  <div className="olist">
    <div className="olist-header">
      <div className="ohcell oh-order">Pedido / Cliente</div>
      <div className="ohcell oh-status">Estado</div>
      <div className="ohcell oh-meta">Entrega / Pago</div>
      <div className="ohcell oh-qty">Ítems / Total</div>
      <div className="ohcell oh-actions">Acciones</div>
    </div>

    <div className="olist-body">
      {filteredOrders.map(order => (
        <OrderRow
          key={order.id}
          pedido={order}
          onUpdateStatus={handleStatusUpdate}
          onViewDetails={handleViewDetails}
          onReject={handleRejectOrder}
          onDelete={handleDeleteOrder}
        />
      ))}
    </div>

    {filteredOrders.length === 0 && (
      <div className="olist-empty">
        <span className="empty-emoji">📋</span>
        <div>No se encontraron pedidos con los filtros actuales.</div>
      </div>
    )}
  </div>
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
