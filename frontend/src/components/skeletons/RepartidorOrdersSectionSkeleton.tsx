import React from 'react';
import './SkeletonBase.css';

/**
 * Skeleton específico para RepartidorOrdersSection
 * Muestra: header con estado websocket + lista de pedidos asignados con mapa
 */
export const RepartidorOrdersSectionSkeleton: React.FC = () => {
  return (
    <div className="repartidor-orders-skeleton" style={{ padding: '24px' }}>
      {/* Header con estado de conexión */}
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
          <div className="skeleton skeleton-text title" style={{ width: '35%' }} />
          <div className="skeleton-flex" style={{ gap: '12px' }}>
            <div className="skeleton skeleton-badge" />
            <div className="skeleton skeleton-icon large" />
          </div>
        </div>
        <div className="skeleton skeleton-text" style={{ width: '55%' }} />
      </div>

      {/* Tabs de estado */}
      <div className="skeleton-flex" style={{ gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e0e0e0', paddingBottom: '16px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-button small" style={{ opacity: i === 0 ? 1 : 0.6 }} />
        ))}
      </div>

      {/* Grid: Lista + Mapa */}
      <div className="skeleton-grid cols-2" style={{ gap: '24px' }}>
        {/* Lista de pedidos */}
        <div>
          <div className="skeleton skeleton-text large skeleton-mb-3" style={{ width: '40%' }} />

          {/* Pedidos */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-card" style={{ marginBottom: '16px', padding: '20px' }}>
              {/* Header del pedido */}
              <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                <div className="skeleton-flex" style={{ gap: '12px' }}>
                  <div className="skeleton skeleton-badge" />
                  <div className="skeleton skeleton-text" style={{ width: '80px' }} />
                </div>
                <div className="skeleton skeleton-badge" />
              </div>

              {/* Información del cliente */}
              <div className="skeleton-flex skeleton-mb-2" style={{ gap: '12px' }}>
                <div className="skeleton skeleton-avatar" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text skeleton-mb-1" style={{ width: '60%' }} />
                  <div className="skeleton skeleton-text small" style={{ width: '80%' }} />
                </div>
              </div>

              {/* Información de la tienda */}
              <div className="skeleton-flex skeleton-mb-3" style={{ gap: '12px', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                <div className="skeleton skeleton-avatar small" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text small skeleton-mb-1" style={{ width: '50%' }} />
                  <div className="skeleton skeleton-text small" style={{ width: '70%' }} />
                </div>
              </div>

              {/* Detalles del pedido */}
              <div style={{ marginBottom: '16px' }}>
                <div className="skeleton skeleton-text small skeleton-mb-1" style={{ width: '40%' }} />
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="skeleton-flex skeleton-mb-1" style={{ gap: '8px', paddingLeft: '12px' }}>
                    <div className="skeleton skeleton-text small" style={{ width: '20px' }} />
                    <div className="skeleton skeleton-text small" style={{ width: '70%' }} />
                  </div>
                ))}
              </div>

              {/* Distancia y tiempo */}
              <div className="skeleton-flex skeleton-mb-3" style={{ justifyContent: 'space-between' }}>
                <div className="skeleton-flex" style={{ gap: '4px' }}>
                  <div className="skeleton skeleton-icon small" />
                  <div className="skeleton skeleton-text small" style={{ width: '50px' }} />
                </div>
                <div className="skeleton-flex" style={{ gap: '4px' }}>
                  <div className="skeleton skeleton-icon small" />
                  <div className="skeleton skeleton-text small" style={{ width: '60px' }} />
                </div>
              </div>

              {/* Precio total */}
              <div style={{ marginBottom: '16px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
                <div className="skeleton-flex" style={{ justifyContent: 'space-between' }}>
                  <div className="skeleton skeleton-text" style={{ width: '30%' }} />
                  <div className="skeleton skeleton-text large" style={{ width: '25%' }} />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="skeleton-flex" style={{ gap: '12px' }}>
                <div className="skeleton skeleton-button" style={{ flex: 1 }} />
                <div className="skeleton skeleton-button" style={{ flex: 1 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Mapa de tracking */}
        <div>
          <div className="skeleton skeleton-text large skeleton-mb-3" style={{ width: '40%' }} />

          <div className="skeleton-card" style={{ height: '600px', position: 'relative' }}>
            {/* Mapa */}
            <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '12px' }} />

            {/* Panel de información sobre el mapa */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '250px',
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <div className="skeleton skeleton-text skeleton-mb-2" style={{ width: '70%' }} />
              <div className="skeleton skeleton-text small skeleton-mb-1" style={{ width: '90%' }} />
              <div className="skeleton skeleton-text small skeleton-mb-2" style={{ width: '80%' }} />
              <div className="skeleton skeleton-button wide skeleton-mt-2" />
            </div>

            {/* Controles del mapa (esquina inferior derecha) */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div className="skeleton skeleton-icon large" />
              <div className="skeleton skeleton-icon large" />
            </div>
          </div>
        </div>
      </div>

      {/* Historial reciente */}
      <div style={{ marginTop: '32px' }}>
        <div className="skeleton skeleton-text large skeleton-mb-3" style={{ width: '30%' }} />
        <div className="skeleton-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-flex"
              style={{
                padding: '16px',
                borderBottom: i < 4 ? '1px solid #e0e0e0' : 'none',
                justifyContent: 'space-between',
              }}
            >
              <div className="skeleton-flex" style={{ gap: '12px', flex: 1 }}>
                <div className="skeleton skeleton-icon" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text skeleton-mb-1" style={{ width: '60%' }} />
                  <div className="skeleton skeleton-text small" style={{ width: '40%' }} />
                </div>
              </div>
              <div className="skeleton-flex" style={{ gap: '12px' }}>
                <div className="skeleton skeleton-badge" />
                <div className="skeleton skeleton-text" style={{ width: '60px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepartidorOrdersSectionSkeleton;
