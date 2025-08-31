import React, { useState, useEffect } from 'react';
import { useAuthOptimized } from '../../../hooks/useAuthOptimized';
import axiosInstance from '../../../config/axios.config';

interface OrderItem {
  id: string;
  productoId: string;
  cantidad: number;
  precio: number;
  producto: {
    id: string;
    nombre: string;
    precio: number;
  };
}

interface Order {
  id: string;
  clienteNombre: string;
  clienteEmail: string;
  empresaId: string;
  estado: 'pendiente' | 'en_proceso' | 'finalizado';
  createdAt: string;
  updatedAt: string;
  ItemPedido: OrderItem[];
  empresa?: {
    id: string;
    name: string;
    email: string;
  };
}

const MyOrders: React.FC = () => {
  const { user } = useAuthOptimized();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendiente' | 'en_proceso' | 'finalizado'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Obtener pedidos del cliente
      const response = await axiosInstance.get('/pedidos', {
        params: { clienteEmail: user.email }
      });
      
      setOrders(response.data || []);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError('Error al cargar tus pedidos');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return '#f59e0b';
      case 'en_proceso': return '#3b82f6';
      case 'finalizado': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente': return '⏳';
      case 'en_proceso': return '⚙️';
      case 'finalizado': return '✅';
      default: return '📋';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En Proceso';
      case 'finalizado': return 'Finalizado';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.estado === statusFilter;
  });

  const stats = {
    total: orders.length,
    pendientes: orders.filter(o => o.estado === 'pendiente').length,
    enProceso: orders.filter(o => o.estado === 'en_proceso').length,
    finalizados: orders.filter(o => o.estado === 'finalizado').length,
  };

  if (loading) {
    return (
      <div className="my-orders-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-orders-error">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Error al cargar pedidos</h3>
          <p className="error-description">{error}</p>
          <button className="btn btn-primary" onClick={loadOrders}>
            <span className="btn-icon">🔄</span>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders">
      {/* Header */}
      <div className="my-orders-header">
        <div className="header-content">
          <h1 className="orders-title">
            <span className="title-icon">📋</span>
            Mis Pedidos
          </h1>
          <p className="orders-subtitle">
            Historial completo de tus pedidos realizados
          </p>
        </div>
        
        <div className="orders-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">
              {stats.total === 1 ? 'Pedido' : 'Pedidos'}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="orders-filters">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <span className="filter-icon">📊</span>
            Todos ({stats.total})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'pendiente' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pendiente')}
          >
            <span className="filter-icon">⏳</span>
            Pendientes ({stats.pendientes})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'en_proceso' ? 'active' : ''}`}
            onClick={() => setStatusFilter('en_proceso')}
          >
            <span className="filter-icon">⚙️</span>
            En Proceso ({stats.enProceso})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'finalizado' ? 'active' : ''}`}
            onClick={() => setStatusFilter('finalizado')}
          >
            <span className="filter-icon">✅</span>
            Finalizados ({stats.finalizados})
          </button>
        </div>
      </div>

      {/* Orders Content */}
      <div className="orders-content">
        {filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-icon">📋</div>
            <h3 className="empty-title">
              {statusFilter === 'all' 
                ? 'No tienes pedidos aún' 
                : `No tienes pedidos ${getStatusLabel(statusFilter).toLowerCase()}`
              }
            </h3>
            <p className="empty-description">
              {statusFilter === 'all'
                ? 'Explora empresas y realiza tu primer pedido'
                : `Cuando tengas pedidos ${getStatusLabel(statusFilter).toLowerCase()}, aparecerán aquí`
              }
            </p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => {
              const total = order.ItemPedido.reduce(
                (sum, item) => sum + (item.precio * item.cantidad), 0
              );
              
              return (
                <div key={order.id} className="order-card">
                  {/* Order Header */}
                  <div className="order-header">
                    <div className="order-id">
                      <span className="id-label">Pedido</span>
                      <span className="id-value">#{order.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div 
                      className="order-status"
                      style={{ 
                        backgroundColor: `${getStatusColor(order.estado)}20`,
                        color: getStatusColor(order.estado),
                        border: `1px solid ${getStatusColor(order.estado)}40`
                      }}
                    >
                      <span className="status-icon">{getStatusIcon(order.estado)}</span>
                      <span className="status-text">{getStatusLabel(order.estado)}</span>
                    </div>
                  </div>

                  {/* Order Company */}
                  {order.empresa && (
                    <div className="order-company">
                      <span className="company-label">Empresa:</span>
                      <span className="company-name">{order.empresa.name}</span>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="order-items">
                    <h4 className="items-title">Productos ({order.ItemPedido.length})</h4>
                    <div className="items-list">
                      {order.ItemPedido.map((item) => (
                        <div key={item.id} className="order-item">
                          <div className="item-info">
                            <span className="item-name">{item.producto.nombre}</span>
                            <span className="item-quantity">x{item.cantidad}</span>
                          </div>
                          <div className="item-price">
                            {formatPrice(item.precio * item.cantidad)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="order-total">
                    <div className="total-label">Total:</div>
                    <div className="total-amount">{formatPrice(total)}</div>
                  </div>

                  {/* Order Date */}
                  <div className="order-date">
                    <span className="date-icon">📅</span>
                    <span className="date-text">
                      Realizado el {new Date(order.createdAt).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
