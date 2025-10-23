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
      }
    } catch (error) {
      console.error('Error cargando foto de transferencia:', error);
    } finally {
      setLoadingFoto(false);
    }
  }, [pedido]);

  useEffect(() => {
    if (!pedido) return;
    if (pedido.formaPago === 'transferencia') {
      loadTransferenciaFoto();
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

  const nextStatus = pedidosService.getNextStatus(pedido.estado, pedido.tipoEntrega);
  const nextStatusText = pedidosService.getNextStatusText(pedido.estado, pedido.tipoEntrega);

  const handleStatusUpdate = () => {
    if (nextStatus && onUpdateStatus) {
      onUpdateStatus(pedido.id, nextStatus as any);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content order-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              Pedido #{pedido.id.substring(0, 8).toUpperCase()}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
              {formatDate(pedido.createdAt)}
            </p>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            style={{
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Estado */}
          <div style={{ marginBottom: '24px' }}>
            {getStatusBadge(pedido.estado)}
          </div>

          {/* Info Cliente */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              👤 Cliente
            </div>
            <div style={{ fontSize: '14px', color: '#111827', marginBottom: '4px' }}>
              {pedido.cliente?.name || 'No disponible'}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              {pedido.cliente?.email || 'No disponible'}
            </div>
          </div>

          {/* Info Entrega y Pago */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              📦 Entrega y Pago
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Tipo de entrega</div>
                <div style={{ fontSize: '14px', color: '#111827' }}>
                  {pedido.tipoEntrega === 'delivery' ? '🚚 Delivery' : '🏪 Retiro'}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Forma de pago</div>
                <div style={{ fontSize: '14px', color: '#111827' }}>
                  {pedido.formaPago === 'transferencia' ? '💳 Transferencia' : '💰 Efectivo'}
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {pedido.tipoEntrega === 'delivery' && pedido.lat && pedido.lng && (
                <button
                  onClick={() => {
                    window.open(`https://www.google.com/maps?q=${pedido.lat},${pedido.lng}`, '_blank');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                   Ver ubicación
                </button>
              )}

              {pedido.formaPago === 'transferencia' && transferenciaFoto && (
                <button
                  onClick={() => setShowFotoModal(true)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                   Ver comprobante
                </button>
              )}
            </div>

            {pedido.direccion && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Dirección</div>
                <div style={{ fontSize: '13px', color: '#111827' }}>{pedido.direccion}</div>
              </div>
            )}
          </div>

          {/* Lista de Items */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              🛒 Detalles del Pedido
            </div>

            {pedido.items?.map((item, index) => (
              <div key={item.id}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  paddingBottom: '12px',
                  marginBottom: '12px',
                  borderBottom: index < pedido.items!.length - 1 ? '1px solid #e5e7eb' : 'none'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500', marginBottom: '4px' }}>
                      {item.producto?.nombre || 'Producto no disponible'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {item.cantidad} × ${item.precio.toFixed(2)}
                    </div>
                    {item.notas && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#92400e',
                        fontStyle: 'italic'
                      }}>
                        💬 "{item.notas}"
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#111827',
                    marginLeft: '12px'
                  }}>
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}

            {/* Totales */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #e5e7eb' }}>
              {pedido.subtotal !== undefined && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  <span style={{ color: '#6b7280' }}>Subtotal</span>
                  <span style={{ color: '#111827', fontWeight: '500' }}>
                    ${pedido.subtotal.toFixed(2)}
                  </span>
                </div>
              )}

              {pedido.costoEnvio !== undefined && pedido.costoEnvio > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  <span style={{ color: '#6b7280' }}>Envío</span>
                  <span style={{ color: '#111827', fontWeight: '500' }}>
                    ${pedido.costoEnvio.toFixed(2)}
                  </span>
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid #e5e7eb',
                fontSize: '16px'
              }}>
                <span style={{ color: '#111827', fontWeight: '600' }}>Total</span>
                <span style={{ color: '#3b82f6', fontWeight: '700', fontSize: '18px' }}>
                  ${(pedido.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cerrar
          </button>

          {nextStatus && onUpdateStatus && (
            <button
              type="button"
              className="btn-primary"
              onClick={handleStatusUpdate}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}
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
