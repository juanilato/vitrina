import React from 'react';
import { OrderModalProps } from '../types';
import pedidosService from '../../../../../services/pedidosService';

const OrderModal: React.FC<OrderModalProps> = ({ 
  pedido, 
  onClose, 
  onUpdateStatus 
}) => {
  if (!pedido) return null;

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

  const handleStatusUpdate = () => {
    if (nextStatus && onUpdateStatus) {
      onUpdateStatus(pedido.id, nextStatus as any);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content order-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalles del Pedido</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Información del pedido */}
          <div className="order-info-section">
            <div className="order-info-header">
              <div className="order-id-large">
                <span className="order-label">Pedido #</span>
                <span className="order-value">{pedido.id.substring(0, 8).toUpperCase()}</span>
              </div>
              {getStatusBadge(pedido.estado)}
            </div>
            
            <div className="order-meta">
              <div className="meta-item">
                <span className="meta-label">Creado:</span>
                <span className="meta-value">{formatDate(pedido.createdAt)}</span>
              </div>
              {pedido.updatedAt !== pedido.createdAt && (
                <div className="meta-item">
                  <span className="meta-label">Actualizado:</span>
                  <span className="meta-value">{formatDate(pedido.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información del cliente */}
          <div className="client-info-section">
            <h3>Información del Cliente</h3>
            <div className="client-details">
              <div className="client-item">
                <span className="client-label">Nombre:</span>
                <span className="client-value">{pedido.cliente?.name || 'No disponible'}</span>
              </div>
              <div className="client-item">
                <span className="client-label">Email:</span>
                <span className="client-value">{pedido.cliente?.email || 'No disponible'}</span>
              </div>
            </div>
          </div>

          {/* Items del pedido */}
          <div className="items-section">
            <h3>Items del Pedido</h3>
            <div className="items-list">
              {pedido.items?.map((item) => (
                <div key={item.id} className="item-row">
                  <div className="item-info">
                    <span className="item-name">{item.producto?.nombre || 'Producto no disponible'}</span>
                    <span className="item-quantity">Cantidad: {item.cantidad}</span>
                  </div>
                  <div className="item-pricing">
                    <span className="item-price">${item.precio.toFixed(2)} c/u</span>
                    <span className="item-total">${(item.precio * item.cantidad).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-total-section">
              <div className="total-row">
                <span className="total-label">Total del Pedido:</span>
                <span className="total-amount">${pedido.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          
          {nextStatus && onUpdateStatus && (
            <button 
              type="button" 
              className="btn-primary"
              onClick={handleStatusUpdate}
            >
              <span className="btn-icon">✅</span>
              {nextStatusText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
