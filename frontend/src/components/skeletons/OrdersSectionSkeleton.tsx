import React from 'react';
import { SkeletonTable } from './SkeletonTable';
import './SkeletonBase.css';

/**
 * Skeleton específico para OrdersSection
 * Muestra: filtros, stats rápidas y tabla de pedidos
 */
export const OrdersSectionSkeleton: React.FC = () => {
  return (
    <div className="orders-section-skeleton" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
          <div className="skeleton skeleton-text title" style={{ width: '25%' }} />
          <div className="skeleton-flex" style={{ gap: '12px' }}>
            <div className="skeleton skeleton-button" />
            <div className="skeleton skeleton-icon large" />
          </div>
        </div>
        <div className="skeleton skeleton-text" style={{ width: '50%' }} />
      </div>

      {/* Filtros rápidos */}
      <div className="skeleton-flex" style={{ gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div className="skeleton skeleton-input" style={{ width: '250px' }} />
        <div className="skeleton skeleton-select" style={{ width: '180px' }} />
        <div className="skeleton skeleton-select" style={{ width: '180px' }} />
        <div className="skeleton skeleton-select" style={{ width: '180px' }} />
        <div className="skeleton skeleton-button small" />
      </div>

      {/* Stats rápidas */}
      <div className="skeleton-grid cols-4 skeleton-mb-3" style={{ marginBottom: '32px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div className="skeleton-flex" style={{ justifyContent: 'center', marginBottom: '12px' }}>
              <div className="skeleton skeleton-icon large" />
            </div>
            <div className="skeleton skeleton-text large skeleton-mb-1" style={{ width: '60%', margin: '0 auto' }} />
            <div className="skeleton skeleton-text small" style={{ width: '80%', margin: '0 auto' }} />
          </div>
        ))}
      </div>

      {/* Tabs de estado */}
      <div className="skeleton-flex" style={{ gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e0e0e0', paddingBottom: '16px' }}>
        {['Todos', 'Pendientes', 'En proceso', 'Completados', 'Cancelados'].map((_, i) => (
          <div
            key={i}
            className="skeleton skeleton-button small"
            style={{ opacity: i === 0 ? 1 : 0.6 }}
          />
        ))}
      </div>

      {/* Tabla de pedidos */}
      <div className="skeleton-card">
        <SkeletonTable rows={8} columns={8} hasHeader hasActions />
      </div>

      {/* Paginación */}
      <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginTop: '24px' }}>
        <div className="skeleton skeleton-text small" style={{ width: '20%' }} />
        <div className="skeleton-flex" style={{ gap: '8px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-icon" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersSectionSkeleton;
