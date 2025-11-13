import React from 'react';
import { SkeletonCard } from './SkeletonCard';
import './SkeletonBase.css';

/**
 * Skeleton específico para TomaPedidosSection (Repartidor)
 * Muestra: header con estado websocket + grid de pedidos disponibles
 */
export const TomaPedidosSectionSkeleton: React.FC = () => {
  return (
    <div className="toma-pedidos-skeleton" style={{ padding: '24px' }}>
      {/* Header con estado de conexión */}
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
          <div className="skeleton skeleton-text title" style={{ width: '40%' }} />
          <div className="skeleton-flex" style={{ gap: '12px' }}>
            <div className="skeleton skeleton-badge" />
            <div className="skeleton skeleton-icon large" />
          </div>
        </div>
        <div className="skeleton skeleton-text" style={{ width: '60%' }} />
      </div>

      {/* Filtros rápidos */}
      <div className="skeleton-flex" style={{ gap: '12px', marginBottom: '24px' }}>
        <div className="skeleton skeleton-button small" />
        <div className="skeleton skeleton-button small" />
        <div className="skeleton skeleton-button small" />
        <div className="skeleton skeleton-input" style={{ width: '250px' }} />
      </div>

      {/* Stats rápidas */}
      <div className="skeleton-grid cols-4 skeleton-mb-3" style={{ marginBottom: '32px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div className="skeleton skeleton-text small skeleton-mb-1" style={{ width: '70%', margin: '0 auto' }} />
            <div className="skeleton skeleton-text large" style={{ width: '50%', margin: '0 auto' }} />
          </div>
        ))}
      </div>

      {/* Grid de pedidos disponibles */}
      <div>
        <div className="skeleton skeleton-text large skeleton-mb-3" style={{ width: '35%' }} />

        <div className="skeleton-grid cols-3" style={{ gap: '20px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card" style={{ position: 'relative' }}>
              {/* Badge de urgencia */}
              <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                <div className="skeleton skeleton-badge" />
              </div>

              {/* Información del pedido */}
              <div style={{ marginBottom: '16px' }}>
                <div className="skeleton skeleton-text large skeleton-mb-2" style={{ width: '60%' }} />
                <div className="skeleton-flex skeleton-mb-1" style={{ gap: '8px' }}>
                  <div className="skeleton skeleton-icon small" />
                  <div className="skeleton skeleton-text small" style={{ width: '70%' }} />
                </div>
                <div className="skeleton-flex skeleton-mb-1" style={{ gap: '8px' }}>
                  <div className="skeleton skeleton-icon small" />
                  <div className="skeleton skeleton-text small" style={{ width: '60%' }} />
                </div>
              </div>

              {/* Información de la tienda */}
              <div className="skeleton-flex skeleton-mb-2" style={{ padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                <div className="skeleton skeleton-avatar" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text skeleton-mb-1" style={{ width: '70%' }} />
                  <div className="skeleton skeleton-text small" style={{ width: '50%' }} />
                </div>
              </div>

              {/* Distancia y tiempo estimado */}
              <div className="skeleton-flex skeleton-mb-2" style={{ justifyContent: 'space-between' }}>
                <div className="skeleton-flex" style={{ gap: '4px' }}>
                  <div className="skeleton skeleton-icon small" />
                  <div className="skeleton skeleton-text small" style={{ width: '50px' }} />
                </div>
                <div className="skeleton-flex" style={{ gap: '4px' }}>
                  <div className="skeleton skeleton-icon small" />
                  <div className="skeleton skeleton-text small" style={{ width: '60px' }} />
                </div>
              </div>

              {/* Precio */}
              <div style={{ marginBottom: '16px' }}>
                <div className="skeleton skeleton-text" style={{ width: '40%', height: '24px' }} />
              </div>

              {/* Botón de acción */}
              <div className="skeleton skeleton-button wide" />
            </div>
          ))}
        </div>
      </div>

      {/* Mensaje de ayuda */}
      <div className="skeleton-card" style={{ marginTop: '32px', padding: '20px', background: '#f0f7ff' }}>
        <div className="skeleton-flex">
          <div className="skeleton skeleton-icon large" />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text skeleton-mb-1" style={{ width: '70%' }} />
            <div className="skeleton skeleton-text small" style={{ width: '90%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TomaPedidosSectionSkeleton;
