import React from 'react';
import { SkeletonTable } from './SkeletonTable';
import './SkeletonBase.css';

/**
 * Skeleton específico para IngredientsSection
 * Muestra: sidebar con búsqueda y filtros + tabla de ingredientes
 */
export const IngredientsSectionSkeleton: React.FC = () => {
  return (
    <div className="ingredients-section-skeleton" style={{ display: 'flex', gap: '24px', padding: '24px' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', flexShrink: 0 }}>
        {/* Búsqueda */}
        <div style={{ marginBottom: '24px' }}>
          <div className="skeleton skeleton-text small skeleton-mb-1" style={{ width: '40%' }} />
          <div className="skeleton skeleton-input" />
        </div>

        {/* Filtros */}
        <div style={{ marginBottom: '24px' }}>
          <div className="skeleton skeleton-text skeleton-mb-2" style={{ width: '50%' }} />

          {/* Categorías */}
          <div className="skeleton-card" style={{ padding: '12px', marginBottom: '16px' }}>
            <div className="skeleton skeleton-text small skeleton-mb-2" style={{ width: '60%' }} />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-flex" style={{ marginBottom: '8px', gap: '8px' }}>
                <div className="skeleton skeleton-icon small" />
                <div className="skeleton skeleton-text small" style={{ width: '70%' }} />
              </div>
            ))}
          </div>

          {/* Stock */}
          <div className="skeleton-card" style={{ padding: '12px' }}>
            <div className="skeleton skeleton-text small skeleton-mb-2" style={{ width: '60%' }} />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-flex" style={{ marginBottom: '8px', gap: '8px' }}>
                <div className="skeleton skeleton-icon small" />
                <div className="skeleton skeleton-text small" style={{ width: '70%' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Botón agregar */}
        <div className="skeleton skeleton-button wide" />
      </div>

      {/* Contenido principal */}
      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div className="skeleton skeleton-text title skeleton-mb-2" style={{ width: '30%' }} />
          <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginTop: '16px' }}>
            <div className="skeleton skeleton-text" style={{ width: '40%' }} />
            <div className="skeleton-flex" style={{ gap: '12px' }}>
              <div className="skeleton skeleton-button small" />
              <div className="skeleton skeleton-button small" />
            </div>
          </div>
        </div>

        {/* Tabla de ingredientes */}
        <div className="skeleton-card">
          <SkeletonTable rows={8} columns={6} hasHeader hasActions />
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
    </div>
  );
};

export default IngredientsSectionSkeleton;
