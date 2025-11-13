import React from 'react';
import './SkeletonBase.css';

/**
 * Skeleton específico para VinculacionSection (Repartidor)
 * Muestra: header con estado websocket + grid de empresas vinculadas
 */
export const VinculacionSectionSkeleton: React.FC = () => {
  return (
    <div className="vinculacion-section-skeleton" style={{ padding: '24px' }}>
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

      {/* Tabs */}
      <div className="skeleton-flex" style={{ gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e0e0e0', paddingBottom: '16px' }}>
        <div className="skeleton skeleton-button small" />
        <div className="skeleton skeleton-button small" style={{ opacity: 0.6 }} />
        <div className="skeleton skeleton-button small" style={{ opacity: 0.6 }} />
      </div>

      {/* Stats rápidas */}
      <div className="skeleton-grid cols-3 skeleton-mb-3" style={{ marginBottom: '32px' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div className="skeleton skeleton-icon large" style={{ margin: '0 auto 12px' }} />
            <div className="skeleton skeleton-text large skeleton-mb-1" style={{ width: '40%', margin: '0 auto' }} />
            <div className="skeleton skeleton-text small" style={{ width: '60%', margin: '0 auto' }} />
          </div>
        ))}
      </div>

      {/* Buscador y filtros */}
      <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginBottom: '24px' }}>
        <div className="skeleton skeleton-input" style={{ width: '300px' }} />
        <div className="skeleton-flex" style={{ gap: '12px' }}>
          <div className="skeleton skeleton-button small" />
          <div className="skeleton skeleton-button small" />
        </div>
      </div>

      {/* Grid de empresas */}
      <div>
        <div className="skeleton skeleton-text large skeleton-mb-3" style={{ width: '30%' }} />

        <div className="skeleton-grid cols-2" style={{ gap: '20px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card" style={{ padding: '20px' }}>
              {/* Header de la empresa */}
              <div className="skeleton-flex skeleton-mb-3" style={{ gap: '16px' }}>
                <div className="skeleton skeleton-avatar large" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text large skeleton-mb-1" style={{ width: '70%' }} />
                  <div className="skeleton skeleton-text small skeleton-mb-1" style={{ width: '50%' }} />
                  <div className="skeleton-flex" style={{ gap: '8px', marginTop: '8px' }}>
                    <div className="skeleton skeleton-badge" />
                    <div className="skeleton skeleton-badge" />
                  </div>
                </div>
              </div>

              {/* Información de contacto */}
              <div style={{ marginBottom: '16px' }}>
                <div className="skeleton-flex skeleton-mb-2" style={{ gap: '8px' }}>
                  <div className="skeleton skeleton-icon small" />
                  <div className="skeleton skeleton-text small" style={{ width: '80%' }} />
                </div>
                <div className="skeleton-flex skeleton-mb-2" style={{ gap: '8px' }}>
                  <div className="skeleton skeleton-icon small" />
                  <div className="skeleton skeleton-text small" style={{ width: '60%' }} />
                </div>
                <div className="skeleton-flex" style={{ gap: '8px' }}>
                  <div className="skeleton skeleton-icon small" />
                  <div className="skeleton skeleton-text small" style={{ width: '70%' }} />
                </div>
              </div>

              {/* Stats de la vinculación */}
              <div className="skeleton-grid cols-3" style={{ gap: '12px', marginBottom: '16px', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} style={{ textAlign: 'center' }}>
                    <div className="skeleton skeleton-text" style={{ width: '50%', height: '24px', margin: '0 auto 4px' }} />
                    <div className="skeleton skeleton-text small" style={{ width: '70%', margin: '0 auto' }} />
                  </div>
                ))}
              </div>

              {/* Información adicional */}
              <div style={{ marginBottom: '16px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
                <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div className="skeleton skeleton-text small" style={{ width: '50%' }} />
                  <div className="skeleton skeleton-text small" style={{ width: '30%' }} />
                </div>
                <div className="skeleton-flex" style={{ justifyContent: 'space-between' }}>
                  <div className="skeleton skeleton-text small" style={{ width: '45%' }} />
                  <div className="skeleton skeleton-text small" style={{ width: '35%' }} />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="skeleton-flex" style={{ gap: '12px' }}>
                <div className="skeleton skeleton-button" style={{ flex: 1 }} />
                <div className="skeleton skeleton-icon" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Solicitudes pendientes (alerta) */}
      <div className="skeleton-card" style={{ marginTop: '32px', padding: '20px', background: '#fff3cd', border: '1px solid #ffc107' }}>
        <div className="skeleton-flex" style={{ gap: '16px' }}>
          <div className="skeleton skeleton-icon large" />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text large skeleton-mb-2" style={{ width: '40%' }} />
            <div className="skeleton skeleton-text skeleton-mb-2" style={{ width: '80%' }} />
            <div className="skeleton-flex" style={{ gap: '12px' }}>
              <div className="skeleton skeleton-button" />
              <div className="skeleton skeleton-button" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VinculacionSectionSkeleton;
