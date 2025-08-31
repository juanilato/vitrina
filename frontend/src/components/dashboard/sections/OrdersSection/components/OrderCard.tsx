import React from 'react';
import { OrderCardProps } from '../types';
import pedidosService from '../../../../../services/pedidosService';

const OrderCard: React.FC<OrderCardProps> = ({ 
  pedido, 
  onUpdateStatus, 
  onViewDetails, 
  onDelete 
}) => {
  if (!pedido || !pedido.id) {
    return null;
  }

  const getStatusBadge = (estado: string) => {
    const color = pedidosService.getStatusColor(estado);
    const text = pedidosService.getStatusText(estado);
    
    return (
      <span 
        className="status-badge" 
        style={{ backgroundColor: color, color: 'white' }}
      >
        {text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pendiente':
        return 'en_proceso';
      case 'en_proceso':
        return 'finalizado';
      default:
        return null;
    }
  };

  const getNextStatusText = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pendiente':
        return 'Marcar en Proceso';
      case 'en_proceso':
        return 'Marcar Finalizado';
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(pedido.estado);
  const nextStatusText = getNextStatusText(pedido.estado);

  return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-id">
          <span className="order-label">Pedido #</span>
          <span className="order-value">{pedido.id.substring(0, 8).toUpperCase()}</span>
        </div>
        {getStatusBadge(pedido.estado)}
      </div>
      
      <div className="order-content">
        <div className="order-client">
          <h3 className="client-name">{pedido.cliente?.name || 'Cliente no disponible'}</h3>
          <p className="client-email">{pedido.cliente?.email || ''}</p>
        </div>
        
        <div className="order-details">
          <div className="order-total">
            <span className="total-label">Total:</span>
            <span className="total-value">${pedido.total?.toFixed(2) || '0.00'}</span>
          </div>
          
          <div className="order-items">
            <span className="items-label">Items:</span>
            <span className="items-value">{pedido.items?.length || 0}</span>
          </div>
          
          <div className="order-date">
            <span className="date-label">Creado:</span>
            <span className="date-value">{formatDate(pedido.createdAt)}</span>
          </div>
        </div>
      </div>
      
      <div className="order-actions">
        <button 
          className="btn-secondary view-btn"
          onClick={() => onViewDetails(pedido)}
        >
          <span className="btn-icon">👁️</span>
          Ver Detalles
        </button>
        
        {nextStatus && (
          <button 
            className="btn-primary status-btn"
            onClick={() => onUpdateStatus(pedido.id, nextStatus as any)}
          >
            <span className="btn-icon">✅</span>
            {nextStatusText}
          </button>
        )}
        
        {onDelete && pedido.estado === 'pendiente' && (
          <button 
            className="btn-danger delete-btn"
            onClick={() => onDelete(pedido.id)}
          >
            <span className="btn-icon">🗑️</span>
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
