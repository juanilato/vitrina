import React, { useState, useEffect, useCallback } from 'react';
import { OrderModalProps } from '../types';
import pedidosService from '../../../../../services/pedidosService';

const OrderModal: React.FC<OrderModalProps> = ({ 
  pedido, 
  onClose, 
  onUpdateStatus 
}) => {
  const [transferenciaFoto, setTransferenciaFoto] = useState<string | null>(null);
  const [loadingFoto, setLoadingFoto] = useState(false);
  const [showFotoModal, setShowFotoModal] = useState(false);

  const loadTransferenciaFoto = useCallback(async () => {
    if (!pedido) return;
    
    setLoadingFoto(true);
    try {
      const foto = await pedidosService.getTransferenciaFoto(pedido.id);
      
      if (foto) {
        setTransferenciaFoto(foto.base64);
      } else {
      }
    } catch (error) {
      console.error('Error cargando foto de transferencia:', error);
    } finally {
      setLoadingFoto(false);
    }
  }, [pedido]);

  // Cargar foto de transferencia si el pedido es de transferencia
  useEffect(() => {
    if (!pedido) return;
    
    
    if (pedido.formaPago === 'transferencia') {
      loadTransferenciaFoto();
    } else {
    }
  }, [pedido, loadTransferenciaFoto]);

  if (!pedido) return null;

  const downloadFoto = () => {
    if (!transferenciaFoto) return;
    
    const link = document.createElement('a');
    link.href = transferenciaFoto;
    link.download = `comprobante_transferencia_${pedido.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        return '🚚 Delivery';
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

  const nextStatus = getNextStatus(pedido.estado, pedido.tipoEntrega);
  const nextStatusText = getNextStatusText(pedido.estado, pedido.tipoEntrega);

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

          {/* Información de entrega y pago */}
          <div className="delivery-payment-section">
            <h3>Información de Entrega y Pago</h3>
            <div className="delivery-payment-details">
              <div className="delivery-payment-item">
                <span className="delivery-payment-label">Tipo de Entrega:</span>
                <span className="delivery-payment-value">{getDeliveryTypeText(pedido.tipoEntrega)}</span>
              </div>
              <div className="delivery-payment-item">
                <span className="delivery-payment-label">Forma de Pago:</span>
                <span className="delivery-payment-value">{getPaymentTypeText(pedido.formaPago)}</span>
              </div>
              {pedido.tipoEntrega === 'delivery' && pedido.deliveryLocation && (
                <div className="delivery-payment-item">
                  <span className="delivery-payment-label">Ubicación:</span>
            
                  <button 
                    className="btn-secondary"
                    style={{ marginLeft: 8 }}
                    onClick={() => {
                      const { lat, lng } = pedido.deliveryLocation!;
                      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                    }}
                  >
                    Ver mapa
                  </button>
                </div>
              )}
              {pedido.tipoEntrega === 'delivery' && (
                <div className="delivery-payment-item">
                  <span className="delivery-payment-label">Envío:</span>
                  <span className="delivery-payment-value">
                    {pedido.shippingPrice?.price
                      ? `$${pedido.shippingPrice.price.toFixed(2)}${pedido.shippingPrice.isEstimated ? ' (estimado)' : ''}`
                      : (pedido.shippingPrice?.message || 'A confirmar')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Foto de transferencia */}
          {pedido.formaPago === 'transferencia' && (
            <div className="transferencia-foto-section">
              <h3>Comprobante de Transferencia</h3>
              <div className="transferencia-foto-container">
                {loadingFoto ? (
                  <div className="foto-loading">
                    <div className="loading-spinner"></div>
                    <span>Cargando comprobante...</span>
                  </div>
                ) : transferenciaFoto ? (
                  <div className="foto-preview-section">
                    <div className="foto-preview-wrapper">
                      <img 
                        src={transferenciaFoto} 
                        alt="Comprobante de Transferencia" 
                        className="foto-preview-image"
                        onClick={() => setShowFotoModal(true)}
                      />
                    </div>
                    <div className="foto-actions">
                      <button 
                        className="btn-secondary foto-action-btn"
                        onClick={() => setShowFotoModal(true)}
                      >
                        Ver Completa
                      </button>
                      <button 
                        className="btn-primary foto-action-btn"
                        onClick={downloadFoto}
                      >
                        Descargar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="foto-not-found">
                    <span className="foto-icon">📷</span>
                    <span>No se encontró comprobante de transferencia</span>
                  </div>
                )}
              </div>
            </div>
          )}

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
              {pedido.tipoEntrega === 'delivery' && (
                <div className="total-row">
                  <span className="total-label">Envío:</span>
                  <span className="total-amount">
                    {pedido.shippingPrice?.price
                      ? `$${pedido.shippingPrice.price.toFixed(2)}`
                      : (pedido.shippingPrice?.message || 'A confirmar')}
                  </span>
                </div>
              )}
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
              {nextStatusText}
            </button>
          )}
        </div>
      </div>

      {/* Modal para ver foto completa */}
      {showFotoModal && transferenciaFoto && (
        <div className="foto-modal-overlay" onClick={() => setShowFotoModal(false)}>
          <div className="foto-modal-content" onClick={e => e.stopPropagation()}>
            <div className="foto-modal-header">
              <h3>Comprobante de Transferencia</h3>
              <button 
                className="foto-modal-close"
                onClick={() => setShowFotoModal(false)}
              >
                ×
              </button>
            </div>
            <div className="foto-modal-body">
              <img 
                src={transferenciaFoto} 
                alt="Comprobante de Transferencia" 
                className="foto-modal-image"
              />
            </div>
            <div className="foto-modal-actions">
              <button 
                className="btn-primary"
                onClick={downloadFoto}
              >
                Descargar
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowFotoModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderModal;
