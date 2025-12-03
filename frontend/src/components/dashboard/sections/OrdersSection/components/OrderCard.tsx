// OrderRow.tsx
import React, { useState } from 'react';
import { OrderCardProps } from '../types';
import pedidosService from '../../../../../services/pedidosService';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

const OrderRow: React.FC<OrderCardProps> = ({
  pedido,
  onUpdateStatus,
  onViewDetails,
  onReject,
  onDelete,
}) => {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [showItems, setShowItems] = useState(false);
  if (!pedido || !pedido.id) return null;

  const statusText = pedidosService.getStatusText(pedido.estado);
  const statusColor = pedidosService.getStatusColor(pedido.estado);
  const nextStatus = pedidosService.getNextStatus(pedido.estado, pedido.tipoEntrega);
  const nextStatusText = pedidosService.getNextStatusText(pedido.estado, pedido.tipoEntrega);

  // Formatear fecha y hora por separado
  const orderDate = new Date(pedido.createdAt);
  const fmtDate = orderDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fmtTime = orderDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const fmtMoney = (n?: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(n ?? 0);

  // Definir los pasos del timeline según el tipo de entrega
  const getTimelineSteps = () => {
    if (pedido.tipoEntrega === 'delivery') {
      return [
        { status: 'pendiente_confirmacion', label: 'Pendiente' },
        { status: 'confirmado', label: 'Confirmado' },
        { status: 'en_proceso', label: 'Preparando' },
        { status: 'esperando_delivery', label: 'Esp. Delivery' },
        { status: 'en_camino', label: 'En camino' },
        { status: 'entregado', label: 'Entregado' }
      ];
    } else {
      return [
        { status: 'pendiente_confirmacion', label: 'Pendiente' },
        { status: 'confirmado', label: 'Confirmado' },
        { status: 'en_proceso', label: 'Preparando' },
        { status: 'esperando_retiro', label: 'Listo' },
        { status: 'entregado', label: 'Retirado' }
      ];
    }
  };

  const timelineSteps = getTimelineSteps();
  const currentStepIndex = timelineSteps.findIndex(step => step.status === pedido.estado);

  return (
    <>
      <div className="modern-order-card">
        <div className="order-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="order-id-badge">#{pedido.id.slice(0, 8).toUpperCase()}</div>
            {pedido.descuento && pedido.descuento > 0 && pedido.promocionesAplicadas && pedido.promocionesAplicadas.length > 0 && (
              <div
                style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title={pedido.promocionesAplicadas.map(p => p.nombre).join(', ')}
              >
                <span>🏷️</span>
                <span>{pedido.promocionesAplicadas.length === 1 ? pedido.promocionesAplicadas[0].nombre : `${pedido.promocionesAplicadas.length} Promos`}</span>
              </div>
            )}
          </div>
          <div className="order-card-actions">
            <button
              className="btn-action btn-action-view"
              onClick={() => onViewDetails?.(pedido)}
              title="Ver detalles del pedido"
            >
              Detalles
            </button>
            {nextStatus && (
              <button
                className="btn-action btn-action-next"
                onClick={() => onUpdateStatus?.(pedido.id, nextStatus as any)}
                title={`Cambiar estado a: ${nextStatusText}`}
              >
                <span className="btn-text">{nextStatusText}</span>
                <ArrowForwardOutlinedIcon fontSize="small" />
              </button>
            )}
            {onDelete && pedido.estado === 'pendiente_confirmacion' && (
              <button
                className="btn-action btn-action-reject"
                onClick={() => setShowReject(true)}
                title="Rechazar este pedido"
              >
                <BlockOutlinedIcon fontSize="small" />
                <span className="btn-text">No confirmar</span>
              </button>
            )}
          </div>
        </div>

        <div className="order-card-body">
          {/* Cliente */}
          <div className="order-client-name">{pedido.cliente?.name || 'Cliente sin nombre'}</div>

          {/* Chips informativos */}
          <div className="order-chips-row">
            <div className="order-chip order-chip-date">
              <CalendarTodayOutlinedIcon fontSize="small" />
              <span>{fmtDate}</span>
            </div>
            <div className="order-chip order-chip-time">
              <AccessTimeOutlinedIcon fontSize="small" />
              <span>{fmtTime}</span>
            </div>
            {pedido.cliente?.email && (
              <div className="order-chip order-chip-email" onClick={() => onViewDetails?.(pedido)} title="Ver detalles">
                <EmailOutlinedIcon fontSize="small" />
                <span>{pedido.cliente.email}</span>
              </div>
            )}
          </div>

          {/* Timeline animado del estado */}
          <div className="order-status-section">
            <div className="order-status-label" style={{ color: statusColor }}>
              {statusText}
            </div>
            <div className="order-timeline">
              {timelineSteps.map((step, index) => {
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                const isLast = index === timelineSteps.length - 1;

                return (
                  <div
                    key={step.status}
                    className={`timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLast ? 'last' : ''}`}
                    style={{
                      backgroundColor: isCompleted
                        ? statusColor
                        : isActive
                          ? statusColor
                          : 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <div className="timeline-step-label">{step.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chips de entrega y pago */}
          <div className="order-chips-row">
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
          </div>

          {/* Valoración */}
          {pedido.Valoracion && (
            <div className="order-rating-section">
              <div className="order-rating-stars">
                {'⭐'.repeat(pedido.Valoracion.calificacionEmpresa)}
                <span className="order-rating-number">
                  {pedido.Valoracion.calificacionEmpresa}/5
                </span>
              </div>
              {pedido.Valoracion.comentarioEmpresa && (
                <div className="order-rating-comment">
                  "{pedido.Valoracion.comentarioEmpresa}"
                </div>
              )}
            </div>
          )}

          {/* Total e items */}
          <div className="order-footer">
            <div
              className="order-items-count order-items-count-clickable"
              onClick={() => setShowItems(!showItems)}
              title="Click para ver items"
            >
              {pedido.items?.length ?? 0} {(pedido.items?.length ?? 0) === 1 ? 'item' : 'items'}
              <span className={`items-arrow ${showItems ? 'open' : ''}`}>▼</span>
            </div>
            <div className="order-total">
              {pedido.descuento && pedido.descuento > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.85em', color: '#10b981', fontWeight: 'normal' }}>
                    Desc. -{fmtMoney(pedido.descuento)}
                  </span>
                  <span>{fmtMoney(pedido.total)}</span>
                </div>
              ) : (
                fmtMoney(pedido.total)
              )}
            </div>
          </div>

          {/* Lista desplegable de items */}
          {showItems && (
            <div className="order-items-dropdown">
              <div className="order-items-list">
                {pedido.items?.map((item, index) => {
                  // Helper para parsear ingredientes extras
                  const parseIngredientesExtras = (extras: any) => {
                    if (!extras) return [];
                    if (Array.isArray(extras)) return extras;
                    if (typeof extras === 'string') {
                      try {
                        return JSON.parse(extras);
                      } catch (e) {
                        return [];
                      }
                    }
                    return [];
                  };

                  const ingredientesExtras = parseIngredientesExtras(item.ingredientesExtras);

                  return (
                    <div key={item.id} className="order-item-row">
                      <div className="order-item-info">
                        <div className="order-item-name">
                          {item.producto?.nombre || 'Producto no disponible'}
                        </div>
                        {ingredientesExtras.length > 0 && (
                          <div className="order-item-extras">
                            <div style={{ fontSize: '10px', fontWeight: '600', color: '#6b7280', marginBottom: '2px' }}>
                              Agregados:
                            </div>
                            {ingredientesExtras.map((extra: any, extraIndex: number) => (
                              <div key={extraIndex} className="order-item-extra">
                                • {extra.cantidad}x {extra.ingrediente?.nombre || 'Extra'}
                              </div>
                            ))}
                          </div>
                        )}
                        {item.notas && (
                          <div className="order-item-notes">💬 {item.notas}</div>
                        )}
                      </div>
                      <div className="order-item-qty">
                        {item.cantidad} × {fmtMoney(item.precio)}
                      </div>
                      <div className="order-item-subtotal">
                        {item.descuento && item.descuento > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ textDecoration: 'line-through', fontSize: '0.85em', color: '#9ca3af' }}>
                              {fmtMoney(item.precio * item.cantidad)}
                            </span>
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                              {fmtMoney((item.precio * item.cantidad) - item.descuento)}
                            </span>
                            {item.promocionAplicada && (
                              <span style={{ fontSize: '0.75em', color: '#10b981' }}>
                                {item.promocionAplicada}
                              </span>
                            )}
                          </div>
                        ) : (
                          fmtMoney(item.precio * item.cantidad)
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="order-items-footer">
                {pedido.subtotal !== undefined && (
                  <div className="order-summary-row">
                    <span>Subtotal</span>
                    <span>{fmtMoney(pedido.subtotal)}</span>
                  </div>
                )}
                {pedido.costoEnvio !== undefined && pedido.costoEnvio > 0 && (
                  <div className="order-summary-row">
                    <span>Envío</span>
                    <span>{fmtMoney(pedido.costoEnvio)}</span>
                  </div>
                )}
                <div className="order-summary-row order-summary-total">
                  <span>Total</span>
                  <span>{fmtMoney(pedido.total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal no confirmación (compacto, formal) */}
      {showReject && (
        <div className="modal-overlay" onClick={() => setShowReject(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>No confirmar pedido</h2>
              <button className="modal-close" onClick={() => setShowReject(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Informá un motivo. El cliente será notificado con este mensaje.
              </p>
              <div className="form-group">
                <label htmlFor="reject-reason">Motivo</label>
                <textarea
                  id="reject-reason"
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: producto sin stock…"
                />
                <div className="form-hint">{reason.length}/500</div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowReject(false)}>Cancelar</button>
              <button
                className="btn-danger"
                disabled={!reason.trim()}
                onClick={() => { onReject?.(pedido.id, reason.trim()); setShowReject(false); setReason(''); }}
              >
                No confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderRow;
