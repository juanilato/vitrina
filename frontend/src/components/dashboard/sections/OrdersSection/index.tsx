import React, { useState, useMemo } from 'react';
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
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
  const [timeFilter, setTimeFilter] = useState<'all' | 'last_hour' | 'last_day'>('all');
  const [selectedOrder, setSelectedOrder] = useState<PedidoWithDetails | null>(null);
  const [showStatusReference, setShowStatusReference] = useState(false);

  // Filtrado combinado: estado + búsqueda + tiempo
  const filteredOrders = useMemo(() => {
    let result = getFilteredOrders(searchTerm, statusFilter);

    // Aplicar filtro de tiempo
    if (timeFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();

      if (timeFilter === 'last_hour') {
        cutoff.setHours(now.getHours() - 1);
      } else if (timeFilter === 'last_day') {
        cutoff.setHours(now.getHours() - 24);
      }

      result = result.filter(order => new Date(order.createdAt) >= cutoff);
    }

    return result;
  }, [searchTerm, statusFilter, timeFilter, getFilteredOrders]);

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
          <div className="sidebar-header-content">
            <h2 className="sidebar-title">
              <span className="sidebar-icon"><ReceiptLongOutlinedIcon /></span>
              Pedidos
            </h2>
            <button
              className="btn-info-icon"
              onClick={() => setShowStatusReference(!showStatusReference)}
              title="Ver flujo de estados del pedido"
            >
              <InfoOutlinedIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
<div className="sidebar-content">
  <div className="sidebar-section">
    <h3 className="sidebar-section-title">Buscar</h3>
    <div className="sidebar-search">
      <input
        type="text"
        placeholder="Cliente o email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="sidebar-search-input"
      />
   
    </div>
  </div>

  {/* Filtros de Tiempo */}
  <div className="sidebar-section">
    <h3 className="sidebar-section-title">Período</h3>
    <div className="sidebar-time-filters">
      <button
        className={`time-filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
        onClick={() => setTimeFilter('all')}
      >
        <FilterListOutlinedIcon fontSize="small" />
        <span>Todos</span>
      </button>
      <button
        className={`time-filter-btn ${timeFilter === 'last_hour' ? 'active' : ''}`}
        onClick={() => setTimeFilter('last_hour')}
      >
        <AccessTimeOutlinedIcon fontSize="small" />
        <span>Última hora</span>
      </button>
      <button
        className={`time-filter-btn ${timeFilter === 'last_day' ? 'active' : ''}`}
        onClick={() => setTimeFilter('last_day')}
      >
        <TodayOutlinedIcon fontSize="small" />
        <span>Último día</span>
      </button>
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

  {/* Referencia de Estados */}


  {(searchTerm || statusFilter !== 'todos' || timeFilter !== 'all') && (
    <div className="sidebar-section">
      <button
        className="cnav-item cnav-item--subtle"
        onClick={() => {
          setSearchTerm('');
          setStatusFilter('todos');
          setTimeFilter('all');
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

{/* Referencia de Estados - Modal flotante */}
{showStatusReference && (
  <div className="status-reference-overlay" onClick={() => setShowStatusReference(false)}>
    <div className="status-reference-card" onClick={(e) => e.stopPropagation()}>
      <div className="status-ref-header">
        <h3>Flujo de Estados del Pedido</h3>
        <button className="status-ref-close" onClick={() => setShowStatusReference(false)}>×</button>
      </div>
      <div className="status-ref-body">
        <div className="status-flow">
          <div className="status-flow-item">
            <div className="status-flow-icon pending">
              <HourglassEmptyOutlinedIcon fontSize="small" />
            </div>
            <div className="status-flow-info">
              <span className="status-flow-name">Pendiente de Confirmación</span>
              <span className="status-flow-desc">Pedido recibido, esperando confirmación</span>
            </div>
          </div>
          <div className="status-flow-arrow">↓</div>

          <div className="status-flow-item">
            <div className="status-flow-icon confirmed">
              <TaskAltOutlinedIcon fontSize="small" />
            </div>
            <div className="status-flow-info">
              <span className="status-flow-name">Confirmado</span>
              <span className="status-flow-desc">Pedido confirmado por el comercio</span>
            </div>
          </div>
          <div className="status-flow-arrow">↓</div>

          <div className="status-flow-item">
            <div className="status-flow-icon processing">
              <SettingsOutlinedIcon fontSize="small" />
            </div>
            <div className="status-flow-info">
              <span className="status-flow-name">En Proceso</span>
              <span className="status-flow-desc">Se está preparando el pedido</span>
            </div>
          </div>
          <div className="status-flow-arrow">↓</div>

          <div className="status-flow-split">
            <div className="status-flow-branch">
              <span className="branch-label">Delivery</span>
              <div className="status-flow-item">
                <div className="status-flow-icon waiting-delivery">
                  <DeliveryDiningOutlinedIcon fontSize="small" />
                </div>
                <div className="status-flow-info">
                  <span className="status-flow-name">Esperando Delivery</span>
                  <span className="status-flow-desc">Listo para entregar al repartidor</span>
                </div>
              </div>
              <div className="status-flow-arrow">↓</div>
              <div className="status-flow-item">
                <div className="status-flow-icon on-way">
                  <NearMeOutlinedIcon fontSize="small" />
                </div>
                <div className="status-flow-info">
                  <span className="status-flow-name">En Camino</span>
                  <span className="status-flow-desc">El repartidor está en camino</span>
                </div>
              </div>
            </div>

            <div className="status-flow-branch">
              <span className="branch-label">Retiro</span>
              <div className="status-flow-item">
                <div className="status-flow-icon waiting-pickup">
                  <StorefrontOutlinedIcon fontSize="small" />
                </div>
                <div className="status-flow-info">
                  <span className="status-flow-name">Esperando Retiro</span>
                  <span className="status-flow-desc">Listo para que el cliente retire</span>
                </div>
              </div>
            </div>
          </div>
          <div className="status-flow-arrow">↓</div>

          <div className="status-flow-item">
            <div className="status-flow-icon delivered">
              <DoneAllOutlinedIcon fontSize="small" />
            </div>
            <div className="status-flow-info">
              <span className="status-flow-name">Entregado</span>
              <span className="status-flow-desc">Pedido completado exitosamente</span>
            </div>
          </div>
        </div>

        <div className="status-ref-footer">
          <div className="status-ref-note">
            <strong>Nota:</strong> Los pedidos pueden ser rechazados en cualquier momento antes de ser confirmados.
          </div>
        </div>
      </div>
    </div>
  </div>
)}


  {/* Lista de pedidos moderna */}
  <div className="orders-grid">
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
