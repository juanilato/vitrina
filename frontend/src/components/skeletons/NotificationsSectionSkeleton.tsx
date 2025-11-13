import React from 'react';
import { SkeletonList } from './SkeletonList';
import './SkeletonBase.css';

/**
 * Skeleton específico para NotificationsSection
 * Muestra: header con contador + filtros + lista de notificaciones
 */
export const NotificationsSectionSkeleton: React.FC = () => {
  return (
    <div className="notifications-section-skeleton" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
          <div className="skeleton-flex" style={{ gap: '16px' }}>
            <div className="skeleton skeleton-text title" style={{ width: '250px' }} />
            <div className="skeleton skeleton-badge" />
          </div>
          <div className="skeleton skeleton-button" />
        </div>
        <div className="skeleton skeleton-text" style={{ width: '50%' }} />
      </div>

      {/* Filtros y búsqueda */}
      <div className="skeleton-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div className="skeleton-flex" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Tabs de filtro */}
          <div className="skeleton-flex" style={{ gap: '12px' }}>
            <div className="skeleton skeleton-button small" />
            <div className="skeleton skeleton-button small" style={{ opacity: 0.6 }} />
            <div className="skeleton skeleton-button small" style={{ opacity: 0.6 }} />
            <div className="skeleton skeleton-button small" style={{ opacity: 0.6 }} />
          </div>

          {/* Búsqueda y ordenar */}
          <div className="skeleton-flex" style={{ gap: '12px' }}>
            <div className="skeleton skeleton-input" style={{ width: '200px' }} />
            <div className="skeleton skeleton-button small" />
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="skeleton-grid cols-4 skeleton-mb-3" style={{ marginBottom: '24px' }}>
        {[
          'Todas',
          'Pedidos',
          'Sistema',
          'Promociones'
        ].map((_, i) => (
          <div key={i} className="skeleton-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div className="skeleton skeleton-icon" style={{ margin: '0 auto 12px' }} />
            <div className="skeleton skeleton-text large skeleton-mb-1" style={{ width: '40%', margin: '0 auto' }} />
            <div className="skeleton skeleton-text small" style={{ width: '60%', margin: '0 auto' }} />
          </div>
        ))}
      </div>

      {/* Lista de notificaciones */}
      <div className="skeleton-card">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="skeleton-flex"
            style={{
              padding: '20px',
              borderBottom: i < 7 ? '1px solid #e0e0e0' : 'none',
              gap: '16px',
              background: i % 3 === 0 ? '#f8f9fa' : 'transparent',
            }}
          >
            {/* Icono o avatar */}
            <div>
              <div className="skeleton skeleton-avatar" />
            </div>

            {/* Contenido */}
            <div style={{ flex: 1 }}>
              {/* Título y badge */}
              <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
                <div className="skeleton skeleton-text" style={{ width: '45%', height: '18px' }} />
                <div className="skeleton skeleton-badge" />
              </div>

              {/* Mensaje */}
              <div className="skeleton skeleton-text skeleton-mb-1" style={{ width: '90%' }} />
              <div className="skeleton skeleton-text skeleton-mb-2" style={{ width: '75%' }} />

              {/* Metadata */}
              <div className="skeleton-flex" style={{ gap: '16px', marginTop: '12px' }}>
                <div className="skeleton-flex" style={{ gap: '4px' }}>
                  <div className="skeleton skeleton-icon small" />
                  <div className="skeleton skeleton-text small" style={{ width: '80px' }} />
                </div>
                <div className="skeleton-flex" style={{ gap: '4px' }}>
                  <div className="skeleton skeleton-icon small" />
                  <div className="skeleton skeleton-text small" style={{ width: '60px' }} />
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="skeleton-flex" style={{ flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <div className="skeleton skeleton-icon" />
              <div className="skeleton skeleton-icon" />
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginTop: '24px', padding: '16px 0' }}>
        <div className="skeleton skeleton-text small" style={{ width: '15%' }} />
        <div className="skeleton-flex" style={{ gap: '8px' }}>
          <div className="skeleton skeleton-icon" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-icon" />
          ))}
          <div className="skeleton skeleton-icon" />
        </div>
        <div className="skeleton skeleton-button small" />
      </div>

      {/* Banner de ayuda */}
      <div className="skeleton-card" style={{ marginTop: '24px', padding: '20px', background: '#e7f3ff', border: '1px solid #2196f3' }}>
        <div className="skeleton-flex" style={{ gap: '16px' }}>
          <div className="skeleton skeleton-icon large" />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text large skeleton-mb-2" style={{ width: '35%' }} />
            <div className="skeleton skeleton-text skeleton-mb-1" style={{ width: '80%' }} />
            <div className="skeleton skeleton-text" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSectionSkeleton;
