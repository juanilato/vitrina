// OrderRow.tsx
import React, { useState } from 'react';
import { OrderCardProps } from '../types';
import pedidosService from '../../../../../services/pedidosService';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';

const OrderRow: React.FC<OrderCardProps> = ({
  pedido,
  onUpdateStatus,
  onViewDetails,
  onReject,
  onDelete,
}) => {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  if (!pedido || !pedido.id) return null;

  const statusText = pedidosService.getStatusText(pedido.estado);
  const statusColor = pedidosService.getStatusColor(pedido.estado);
  const nextStatus = pedidosService.getNextStatus(pedido.estado, pedido.tipoEntrega);
  const nextStatusText = pedidosService.getNextStatusText(pedido.estado, pedido.tipoEntrega);

  const fmt = (d: string) =>
    new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  const fmtMoney = (n?: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(n ?? 0);

  return (
    <>
      <div className="olist-row">
        {/* Columna: Pedido / Cliente */}
        <div className="ocell ocell-order">
          <div className="ohead">
            <span className="oid">#{pedido.id.slice(0, 8).toUpperCase()}</span>
            <span className="otime">{fmt(pedido.createdAt)}</span>
          </div>
          <div className="obody">
            <div className="oname">{pedido.cliente?.name || 'Cliente sin nombre'}</div>
            {pedido.cliente?.email && <div className="oemail">{pedido.cliente.email}</div>}
          </div>
        </div>

        {/* Columna: Estado */}
        <div className="ocell ocell-status">
          <span className="ostate-pill" style={{ background: statusColor }}>{statusText}</span>
        </div>

        {/* Columna: Entrega / Pago */}
        <div className="ocell ocell-meta">
          <div className="ometa">
            <span className="olabel">Entrega</span>
            <span className="ovalue">{pedido.tipoEntrega === 'delivery' ? 'Delivery' : 'Retiro'}</span>
          </div>
          <div className="ometa">
            <span className="olabel">Pago</span>
            <span className="ovalue">{pedido.formaPago === 'transferencia' ? 'Transferencia' : 'Efectivo'}</span>
          </div>
        </div>

        {/* Columna: Items / Total */}
        <div className="ocell ocell-qty">
          <div className="ometa">
            <span className="olabel">Items</span>
            <span className="ovalue">{pedido.items?.length ?? 0}</span>
          </div>
          <div className="ometa">
            <span className="olabel">Total</span>
            <span className="ovalue ostrong">{fmtMoney(pedido.total)}</span>
          </div>
        </div>

        {/* Columna: Acciones */}
        <div className="ocell ocell-actions">
          <div className="oactions">
            <button
              className="btn-action btn-action-view"
              onClick={() => onViewDetails?.(pedido)}
              title="Ver detalles completos del pedido"
            >
              <VisibilityOutlinedIcon fontSize="small" />
              <span className="btn-text">Detalles</span>
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
