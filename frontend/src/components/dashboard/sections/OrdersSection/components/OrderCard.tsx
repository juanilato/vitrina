import React, { useState } from 'react';
import { OrderCardProps } from '../types';
import pedidosService from '../../../../../services/pedidosService';

const OrderCard: React.FC<OrderCardProps> = ({ 
  pedido, 
  onUpdateStatus, 
  onViewDetails, 
  onReject,
  onDelete 
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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

  const getNextStatus = (currentStatus: string, tipoEntrega: 'delivery' | 'retiro') => {
    return pedidosService.getNextStatus(currentStatus, tipoEntrega);
  };

  const getNextStatusText = (currentStatus: string, tipoEntrega: 'delivery' | 'retiro') => {
    return pedidosService.getNextStatusText(currentStatus, tipoEntrega);
  };

  const getDeliveryTypeText = (tipoEntrega: string) => {
    switch (tipoEntrega) {
      case 'delivery':
        return '🏍️ Delivery';
      case 'retiro':
        return '🏪 Retiro';
      default:
        return '❓ Desconocido';
    }
  };

  const getPaymentTypeText = (formaPago: string) => {
    switch (formaPago) {
      case 'transferencia':
        return '💳 Transferencia';
      case 'efectivo':
        return '💰 Efectivo';
      default:
        return '❓ Desconocido';
    }
  };

  const handleRejectOrder = () => {
    if (rejectReason.trim()) {
      onReject?.(pedido.id, rejectReason.trim());
      setShowRejectModal(false);
      setRejectReason('');
    }
  };

  const nextStatus = getNextStatus(pedido.estado, pedido.tipoEntrega);
  const nextStatusText = getNextStatusText(pedido.estado, pedido.tipoEntrega);

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
          
          <div className="order-delivery">
            <span className="delivery-label">Entrega:</span>
            <span className="delivery-value">{getDeliveryTypeText(pedido.tipoEntrega)}</span>
          </div>
          
          <div className="order-payment">
            <span className="payment-label">Pago:</span>
            <span className="payment-value">{getPaymentTypeText(pedido.formaPago)}</span>
          </div>
          
          <div className="order-date">
            <span className="date-label">Creado:</span>
            <span className="date-value">{formatDate(pedido.createdAt)}</span>
          </div>

          {pedido.estado === 'no_confirmado' && pedido.motivoRechazo && (
            <div className="order-rejection-reason">
              <span className="rejection-label">Motivo de rechazo:</span>
              <span className="rejection-value">{pedido.motivoRechazo}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="order-actions">
        <button 
          className="btn-secondary view-btn"
          onClick={() => onViewDetails(pedido)}
        >
          Ver Detalles
        </button>
        
        {nextStatus && (
          <button 
            className="btn-primary status-btn"
            onClick={() => onUpdateStatus(pedido.id, nextStatus as any)}
          >
            {nextStatusText}
          </button>
        )}
        
          {onDelete && pedido.estado === 'pendiente_confirmacion' && (
            <button 
              className="btn-danger delete-btn"
              onClick={() => setShowRejectModal(true)}
            >
              No confirmar
            </button>
          )}
      </div>

      {/* Modal de no confirmación */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">No Confirmar Pedido</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p className="modal-description">
                ¿Por qué no confirmas este pedido? El cliente recibirá una notificación con el motivo que ingreses.
              </p>
              
              <div className="form-group">
                <label htmlFor="reject-reason" className="form-label">
                  Motivo de no confirmación:
                </label>
                <textarea
                  id="reject-reason"
                  className="form-textarea"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ej: Producto agotado, datos de pago incorrectos, dirección no válida..."
                  rows={4}
                  maxLength={500}
                />
                <div className="form-char-count">
                  {rejectReason.length}/500 caracteres
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-danger"
                onClick={handleRejectOrder}
                disabled={!rejectReason.trim()}
              >
                No Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
