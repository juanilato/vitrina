import React, { useState, useEffect, useCallback } from 'react';
import { OrderModalProps } from '../types';
import pedidosService from '../../../../../services/pedidosService';
import AsignarRepartidorModal from './AsignarRepartidorModal';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

const OrderModal: React.FC<OrderModalProps> = ({
  pedido,
  onClose,
  onUpdateStatus
}) => {
  const [transferenciaFoto, setTransferenciaFoto] = useState<string | null>(null);
  const [loadingFoto, setLoadingFoto] = useState(false);
  const [showFotoModal, setShowFotoModal] = useState(false);
  const [showAsignarRepartidor, setShowAsignarRepartidor] = useState(false);

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

  // Helper para parsear ingredientes extras si vienen como string
  const parseIngredientesExtras = (extras: any) => {
    if (!extras) return [];
    if (Array.isArray(extras)) return extras;
    if (typeof extras === 'string') {
      try {
        const parsed = JSON.parse(extras);
        console.log('📦 Ingredientes extras parseados:', parsed);
        return parsed;
      } catch (e) {
        console.error('Error parseando ingredientesExtras:', e);
        return [];
      }
    }
    return [];
  };

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

  // Timeline steps para el modal
  const getTimelineSteps = () => {
    if (pedido.tipoEntrega === 'delivery') {
      return [
        { status: 'pendiente_confirmacion', label: 'Esperando confirmación', icon: HourglassEmptyOutlinedIcon, color: '#f59e0b' },
        { status: 'confirmado', label: 'Confirmado', icon: TaskAltOutlinedIcon, color: '#10b981' },
        { status: 'en_proceso', label: 'En preparación', icon: RestaurantOutlinedIcon, color: '#3b82f6' },
        { status: 'esperando_delivery', label: 'Esperando repartidor', icon: DeliveryDiningOutlinedIcon, color: '#8b5cf6' },
        { status: 'en_camino', label: 'En camino', icon: NearMeOutlinedIcon, color: '#06b6d4' },
        { status: 'entregado', label: 'Entregado', icon: DoneAllOutlinedIcon, color: '#22c55e' }
      ];
    } else {
      return [
        { status: 'pendiente_confirmacion', label: 'Esperando confirmación', icon: HourglassEmptyOutlinedIcon, color: '#f59e0b' },
        { status: 'confirmado', label: 'Confirmado', icon: TaskAltOutlinedIcon, color: '#10b981' },
        { status: 'en_proceso', label: 'En preparación', icon: RestaurantOutlinedIcon, color: '#3b82f6' },
        { status: 'esperando_retiro', label: 'Listo para retiro', icon: StorefrontOutlinedIcon, color: '#ec4899' },
        { status: 'entregado', label: 'Retirado', icon: DoneAllOutlinedIcon, color: '#22c55e' }
      ];
    }
  };

  const timelineSteps = getTimelineSteps();
  const currentStepIndex = timelineSteps.findIndex(step => step.status === pedido.estado);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content order-modal-modern" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="order-modal-header">
          <div className="order-modal-header-left">
            <div className="order-id-badge-modal">
              #{pedido.id.substring(0, 8).toUpperCase()}
            </div>
            <div className="order-modal-header-info">
              <div className="order-modal-client-name">
                {pedido.cliente?.name || 'Cliente sin nombre'}
              </div>
              <div className="order-modal-date">
                {formatDate(pedido.createdAt)}
              </div>
            </div>
          </div>
          <button className="modal-close-modern" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Body */}
        <div className="order-modal-body">
          {/* Chips informativos horizontal */}
          <div className="order-modal-chips-section">
            <div className="order-chip order-chip-delivery">
              {pedido.tipoEntrega === 'delivery' ? (
                <LocalShippingOutlinedIcon fontSize="small" />
              ) : (
                <StorefrontOutlinedIcon fontSize="small" />
              )}
              <span>{pedido.tipoEntrega === 'delivery' ? 'Delivery' : 'Retiro en local'}</span>
            </div>
            <div className="order-chip order-chip-payment">
              <AccountBalanceWalletOutlinedIcon fontSize="small" />
              <span>{pedido.formaPago === 'transferencia' ? 'Transferencia' : 'Efectivo'}</span>
            </div>
            {pedido.cliente?.email && (
              <div className="order-chip order-chip-email">
                <EmailOutlinedIcon fontSize="small" />
                <span>{pedido.cliente.email}</span>
              </div>
            )}
          </div>

          {/* Timeline completo del estado */}
          <div className="modal-timeline-section">
            <h3 className="modal-section-title">
              Estado del Pedido
            </h3>
            <div className="modal-timeline">
              {timelineSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                const isPending = index > currentStepIndex;

                return (
                  <div key={step.status} className="modal-timeline-row">
                    {/* Indicador y línea */}
                    <div className="modal-timeline-indicator-column">
                      {index > 0 && (
                        <div className={`modal-timeline-connector ${isCompleted ? 'completed' : ''}`} />
                      )}

                      <div
                        className={`modal-timeline-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                        style={{
                          borderColor: isActive || isCompleted ? step.color : '#d1d5db',
                          backgroundColor: isActive || isCompleted ? step.color : '#f3f4f6'
                        }}
                      >
                        {isCompleted ? (
                          <CheckOutlinedIcon fontSize="small" style={{ color: '#fff' }} />
                        ) : (
                          <StepIcon
                            fontSize="small"
                            style={{ color: isActive ? '#fff' : '#9ca3af' }}
                          />
                        )}

                        {isActive && (
                          <div
                            className="modal-timeline-pulse"
                            style={{ backgroundColor: step.color }}
                          />
                        )}
                      </div>

                      {index < timelineSteps.length - 1 && (
                        <div className={`modal-timeline-connector ${isCompleted ? 'completed' : ''}`} />
                      )}
                    </div>

                    {/* Contenido del paso */}
                    <div className="modal-timeline-content">
                      <div
                        className={`modal-timeline-label ${isActive || isCompleted ? 'active' : ''}`}
                        style={{ color: isActive || isCompleted ? step.color : '#6b7280' }}
                      >
                        {step.label}
                      </div>
                      {isActive && (
                        <span className="modal-timeline-badge" style={{ backgroundColor: step.color }}>
                          En proceso
                        </span>
                      )}
                      {isCompleted && (
                        <span className="modal-timeline-badge completed">
                          Completado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dirección y botones de acción */}
          {(pedido.direccion || (pedido.tipoEntrega === 'delivery' && pedido.lat && pedido.lng) || (pedido.formaPago === 'transferencia' && transferenciaFoto)) && (
            <div className="order-modal-section">
              <h3 className="modal-section-title">Información de Entrega</h3>

              {pedido.direccion && (
                <div className="order-modal-address">
                  📍 {pedido.direccion}
                </div>
              )}

              <div className="order-modal-action-buttons">
                {pedido.tipoEntrega === 'delivery' && pedido.lat && pedido.lng && (
                  <button
                    className="order-modal-btn order-modal-btn-map"
                    onClick={() => {
                      window.open(`https://www.google.com/maps?q=${pedido.lat},${pedido.lng}`, '_blank');
                    }}
                  >
                    🗺️ Ver ubicación
                  </button>
                )}

                {pedido.formaPago === 'transferencia' && transferenciaFoto && (
                  <button
                    className="order-modal-btn order-modal-btn-receipt"
                    onClick={() => setShowFotoModal(true)}
                  >
                    🧾 Ver comprobante
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Valoración */}
          {pedido.Valoracion && (
            <div className="order-modal-section">
              <h3 className="modal-section-title">
                ⭐ Valoración del Cliente
              </h3>

              <div className="valoracion-details">
                {/* Valoración de la empresa */}
                <div className="valoracion-empresa-card">
                  <div className="valoracion-header">
                    <span className="valoracion-label">Calificación General</span>
                    <div className="valoracion-stars-display">
                      {'⭐'.repeat(pedido.Valoracion.calificacionEmpresa)}
                      <span className="valoracion-rating-number">
                        {pedido.Valoracion.calificacionEmpresa}/5
                      </span>
                    </div>
                  </div>

                  {pedido.Valoracion.comentarioEmpresa && (
                    <div className="valoracion-comment-box">
                      <div className="valoracion-comment-label">Comentario:</div>
                      <div className="valoracion-comment-text">
                        "{pedido.Valoracion.comentarioEmpresa}"
                      </div>
                    </div>
                  )}

                  {pedido.Valoracion.aspectosEmpresa && pedido.Valoracion.aspectosEmpresa.length > 0 && (
                    <div className="valoracion-aspectos">
                      <div className="valoracion-aspectos-label">Aspectos destacados:</div>
                      <div className="valoracion-aspectos-tags">
                        {pedido.Valoracion.aspectosEmpresa.map((aspecto, index) => (
                          <span key={index} className="valoracion-tag">
                            {aspecto.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Valoración del repartidor (si existe) */}
                {pedido.Valoracion.calificacionRepartidor && (
                  <div className="valoracion-repartidor-card">
                    <div className="valoracion-header">
                      <span className="valoracion-label">Calificación del Repartidor</span>
                      <div className="valoracion-stars-display">
                        {'⭐'.repeat(pedido.Valoracion.calificacionRepartidor)}
                        <span className="valoracion-rating-number">
                          {pedido.Valoracion.calificacionRepartidor}/5
                        </span>
                      </div>
                    </div>

                    {pedido.Valoracion.comentarioRepartidor && (
                      <div className="valoracion-comment-box">
                        <div className="valoracion-comment-label">Comentario:</div>
                        <div className="valoracion-comment-text">
                          "{pedido.Valoracion.comentarioRepartidor}"
                        </div>
                      </div>
                    )}

                    {pedido.Valoracion.aspectosRepartidor && pedido.Valoracion.aspectosRepartidor.length > 0 && (
                      <div className="valoracion-aspectos">
                        <div className="valoracion-aspectos-label">Aspectos destacados:</div>
                        <div className="valoracion-aspectos-tags">
                          {pedido.Valoracion.aspectosRepartidor.map((aspecto, index) => (
                            <span key={index} className="valoracion-tag valoracion-tag-repartidor">
                              {aspecto.replace(/_/g, ' ').toLowerCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Fecha de valoración */}
                <div className="valoracion-fecha">
                  Valorado el {new Date(pedido.Valoracion.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Lista de Items */}
          <div className="order-modal-section">
            <h3 className="modal-section-title">
              🛒 Detalles del Pedido
            </h3>

            <div className="order-modal-items-list">
              {pedido.items?.map((item, index) => {
                const ingredientesExtras = parseIngredientesExtras(item.ingredientesExtras);

                return (
                  <div key={item.id} className="order-modal-item-row">
                    <div className="order-modal-item-info">
                      <div className="order-modal-item-name">
                        {item.producto?.nombre || 'Producto no disponible'}
                      </div>
                      {ingredientesExtras.length > 0 && (
                        <div className="order-modal-item-extras">
                          <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                            Agregados:
                          </div>
                          {ingredientesExtras.map((extra: any, extraIndex: number) => (
                            <div key={extraIndex} className="order-modal-item-extra">
                              • {extra.cantidad}x {extra.ingrediente?.nombre || 'Extra'}
                            </div>
                          ))}
                        </div>
                      )}
                      {item.notas && (
                        <div className="order-modal-item-notes">
                          💬 "{item.notas}"
                        </div>
                      )}
                      <div className="order-modal-item-qty">
                        {item.cantidad} × ${item.precio.toFixed(2)}
                      </div>
                    </div>
                    <div className="order-modal-item-subtotal">
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totales */}
            <div className="order-modal-totals">
              {pedido.subtotal !== undefined && (
                <div className="order-modal-total-row">
                  <span>Subtotal</span>
                  <span>${pedido.subtotal.toFixed(2)}</span>
                </div>
              )}

              {pedido.costoEnvio !== undefined && pedido.costoEnvio > 0 && (
                <div className="order-modal-total-row">
                  <span>Envío</span>
                  <span>${pedido.costoEnvio.toFixed(2)}</span>
                </div>
              )}

              <div className="order-modal-total-row order-modal-total-final">
                <span>Total</span>
                <span>${(pedido.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="order-modal-footer">
          <div className="order-modal-footer-left">
            {pedido.tipoEntrega === 'delivery' && pedido.estado === 'esperando_delivery' && !pedido.repartidorId && (
              <button
                type="button"
                className="order-modal-btn order-modal-btn-assign"
                onClick={() => setShowAsignarRepartidor(true)}
              >
                🚴 Asignar Repartidor
              </button>
            )}
          </div>

          <div className="order-modal-footer-right">
            <button
              type="button"
              className="order-modal-btn order-modal-btn-close"
              onClick={onClose}
            >
              Cerrar
            </button>

            {nextStatus && onUpdateStatus && (
              <button
                type="button"
                className="order-modal-btn order-modal-btn-primary"
                onClick={handleStatusUpdate}
              >
                {nextStatusText}
              </button>
            )}
          </div>
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

      {/* Modal para asignar repartidor */}
      {showAsignarRepartidor && (
        <AsignarRepartidorModal
          pedidoId={pedido.id}
          empresaId={pedido.empresaId}
          onClose={() => setShowAsignarRepartidor(false)}
          onSuccess={() => {
            if (onUpdateStatus) {
              window.location.reload();
            }
          }}
        />
      )}
    </div>
  );
};

export default OrderModal;
