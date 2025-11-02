import React, { useState, useEffect } from 'react';
import { useAuthOptimized } from '../../../hooks/useAuthOptimized';
import axiosInstance from '../../../config/axios.config';
import { OrderCard, Order as OrderCardType, OrderStatus } from './OrderCard';

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
  estado: OrderStatus;
  tipoEntrega?: 'delivery' | 'retiro';
  formaPago?: 'transferencia' | 'efectivo';
  direccionEntrega?: string;
  createdAt: string;
  updatedAt: string;
  ItemPedido: OrderItem[];
  empresa?: {
    id: string;
    name: string;
    email: string;
    logo?: string;
  };
}

const MyOrders: React.FC = () => {
  const { user } = useAuthOptimized();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

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

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente_confirmacion': return 'Pendiente confirmación';
      case 'confirmado': return 'Confirmado';
      case 'en_proceso': return 'En Proceso';
      case 'esperando_delivery': return 'Esperando delivery';
      case 'en_camino': return 'En camino';
      case 'entregado': return 'Entregado';
      case 'esperando_retiro': return 'Esperando retiro';
      case 'no_confirmado': return 'No confirmado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.estado === statusFilter;
  });

  const stats = {
    total: orders.length,
    pendienteConfirmacion: orders.filter(o => o.estado === 'pendiente_confirmacion').length,
    confirmado: orders.filter(o => o.estado === 'confirmado').length,
    enProceso: orders.filter(o => o.estado === 'en_proceso').length,
    enCamino: orders.filter(o => o.estado === 'en_camino').length,
    entregado: orders.filter(o => o.estado === 'entregado').length,
    noConfirmado: orders.filter(o => o.estado === 'no_confirmado').length,
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
            className={`filter-btn ${statusFilter === 'pendiente_confirmacion' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pendiente_confirmacion')}
          >
            <span className="filter-icon">⏳</span>
            Pendientes ({stats.pendienteConfirmacion})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'confirmado' ? 'active' : ''}`}
            onClick={() => setStatusFilter('confirmado')}
          >
            <span className="filter-icon">✓</span>
            Confirmados ({stats.confirmado})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'en_proceso' ? 'active' : ''}`}
            onClick={() => setStatusFilter('en_proceso')}
          >
            <span className="filter-icon">👨‍🍳</span>
            En Proceso ({stats.enProceso})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'en_camino' ? 'active' : ''}`}
            onClick={() => setStatusFilter('en_camino')}
          >
            <span className="filter-icon">🏍️</span>
            En Camino ({stats.enCamino})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'entregado' ? 'active' : ''}`}
            onClick={() => setStatusFilter('entregado')}
          >
            <span className="filter-icon">✅</span>
            Entregados ({stats.entregado})
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

              // Transformar el pedido al formato que espera OrderCard
              const orderCardData: OrderCardType = {
                id: order.id,
                clienteId: order.clienteNombre,
                empresaId: order.empresaId,
                estado: order.estado,
                tipoEntrega: order.tipoEntrega || 'retiro',
                formaPago: order.formaPago || 'efectivo',
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                items: order.ItemPedido.map(item => ({
                  id: item.id,
                  productoId: item.productoId,
                  cantidad: item.cantidad,
                  precio: item.precio,
                  producto: item.producto
                })),
                empresa: order.empresa,
                total: total,
                direccionEntrega: order.direccionEntrega
              };

              return <OrderCard key={order.id} order={orderCardData} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
