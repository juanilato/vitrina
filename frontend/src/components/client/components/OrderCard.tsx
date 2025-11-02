/**
 * Order Card Component (Web)
 * Tarjeta que muestra la información de un pedido
 * Migrado desde mobile para mantener consistencia
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderCard.css';

export type OrderStatus =
  | 'pendiente_confirmacion'
  | 'confirmado'
  | 'en_proceso'
  | 'esperando_delivery'
  | 'en_camino'
  | 'entregado'
  | 'esperando_retiro'
  | 'no_confirmado'
  | 'cancelado';

export interface OrderItem {
  id: string;
  productoId: string;
  cantidad: number;
  precio: number;
  producto?: {
    id: string;
    nombre: string;
    precio: number;
  };
}

export interface Order {
  id: string;
  clienteId: string;
  empresaId: string;
  estado: OrderStatus;
  tipoEntrega: 'delivery' | 'retiro';
  formaPago: 'transferencia' | 'efectivo';
  motivoRechazo?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  empresa?: {
    id: string;
    name: string;
    logo?: string;
  };
  total?: number;
  direccionEntrega?: string;
}

interface OrderCardProps {
  order: Order;
}

const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente_confirmacion':
        return { label: 'Pendiente', icon: '⏳', color: '#f59e0b' };
      case 'confirmado':
        return { label: 'Confirmado', icon: '✓', color: '#10b981' };
      case 'en_proceso':
        return { label: 'En Proceso', icon: '👨‍🍳', color: '#3b82f6' };
      case 'esperando_delivery':
        return { label: 'Esperando Delivery', icon: '📦', color: '#8b5cf6' };
      case 'en_camino':
        return { label: 'En Camino', icon: '🏍️', color: '#06b6d4' };
      case 'entregado':
        return { label: 'Entregado', icon: '✅', color: '#10b981' };
      case 'esperando_retiro':
        return { label: 'Listo para Retiro', icon: '🏪', color: '#8b5cf6' };
      case 'no_confirmado':
        return { label: 'No Confirmado', icon: '✕', color: '#ef4444' };
      case 'cancelado':
        return { label: 'Cancelado', icon: '🚫', color: '#6b7280' };
      default:
        return { label: status, icon: '📋', color: '#6b7280' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div
      className="order-status-badge"
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        borderColor: `${config.color}40`
      }}
    >
      <span className="status-icon">{config.icon}</span>
      <span className="status-text">{config.label}</span>
    </div>
  );
};

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();

  const handlePress = () => {
    navigate(`/client/order/${order.id}`);
  };

  const handleTrackDelivery = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/client/order/${order.id}?showMap=true`);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const totalItems = order.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;

  return (
    <div
      className="order-card-container"
      onClick={handlePress}
    >
      {/* Header */}
      <div className="order-card-header">
        <div className="order-card-header-left">
          <h3 className="order-number">Pedido #{order.id.slice(0, 8)}</h3>
          <p className="order-date">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.estado} />
      </div>

      {/* Company Info */}
      <div className="order-company-section">
        {order.empresa?.logo && (
          <img
            src={order.empresa.logo}
            alt={order.empresa.name}
            className="order-company-logo"
          />
        )}
        <div className="order-company-info">
          <h4 className="order-company-name">
            {order.empresa?.name || 'Empresa'}
          </h4>
          <div className="order-items-row">
            <span className="order-items-icon">📦</span>
            <span className="order-items-text">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="order-delivery-section">
        <div className="order-delivery-row">
          <span className="order-delivery-icon">
            {order.tipoEntrega === 'delivery' ? '🏍️' : '🏪'}
          </span>
          <span className="order-delivery-text">
            {order.tipoEntrega === 'delivery' ? 'Delivery' : 'Retiro en local'}
          </span>
        </div>

        {order.tipoEntrega === 'delivery' && order.direccionEntrega && (
          <p className="order-address">{order.direccionEntrega}</p>
        )}
      </div>

      {/* En camino indicator */}
      {order.estado === 'en_camino' && order.tipoEntrega === 'delivery' && (
        <button
          className="order-tracking-banner"
          onClick={handleTrackDelivery}
        >
          <div className="tracking-content">
            <span className="tracking-icon">📍</span>
            <span className="tracking-text">Tu pedido está en camino</span>
          </div>
          <span className="tracking-map-icon">🗺️</span>
        </button>
      )}

      {/* Footer */}
      <div className="order-card-footer">
        <div className="order-total-section">
          <span className="order-total-label">Total</span>
          <span className="order-total-amount">
            ${formatPrice(order.total || 0)}
          </span>
        </div>

        <div className="order-arrow-container">
          <span className="order-arrow">›</span>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
