import React from 'react';
import { SkeletonStat } from './SkeletonStat';
import './SkeletonBase.css';

/**
 * Skeleton específico para StatsSection
 * Muestra: stats principales, grid de estadísticas secundarias, productos top
 */
export const StatsSectionSkeleton: React.FC = () => {
  return (
    <div className="stats-section-skeleton" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton skeleton-text title skeleton-mb-2" style={{ width: '30%' }} />
        <div className="skeleton skeleton-text" style={{ width: '50%' }} />
      </div>

      {/* Stats principales en grid de 4 columnas */}
      <div className="skeleton-grid cols-4 skeleton-mb-3" style={{ marginBottom: '32px' }}>
        <SkeletonStat hasIcon hasTrend />
        <SkeletonStat hasIcon hasTrend />
        <SkeletonStat hasIcon hasTrend />
        <SkeletonStat hasIcon hasTrend />
      </div>

      {/* Grid 2 columnas: Gráfico + Stats secundarias */}
      <div className="skeleton-grid cols-2 skeleton-mb-3" style={{ gap: '24px', marginBottom: '32px' }}>
        {/* Gráfico grande */}
        <div className="skeleton-card" style={{ minHeight: '300px' }}>
          <div className="skeleton skeleton-text large skeleton-mb-2" style={{ width: '40%' }} />
          <div className="skeleton skeleton-text skeleton-mb-3" style={{ width: '60%' }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{
                  flex: 1,
                  height: `${40 + Math.random() * 60}%`,
                  borderRadius: '4px 4px 0 0',
                }}
              />
            ))}
          </div>
        </div>

        {/* Stats secundarias */}
        <div>
          <div className="skeleton skeleton-text large skeleton-mb-2" style={{ width: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-card" style={{ padding: '16px' }}>
                <SkeletonStat variant="inline" hasIcon={false} hasTrend={false} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Productos más vendidos */}
      <div>
        <div className="skeleton skeleton-text large skeleton-mb-2" style={{ width: '30%' }} />
        <div className="skeleton-grid cols-3" style={{ gap: '16px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-flex skeleton-mb-2">
                <div className="skeleton skeleton-image square" style={{ width: '60px', paddingBottom: '60px' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text skeleton-mb-1" style={{ width: '80%' }} />
                  <div className="skeleton skeleton-text small skeleton-mb-1" style={{ width: '60%' }} />
                  <div className="skeleton skeleton-text small" style={{ width: '40%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pedidos recientes */}
      <div style={{ marginTop: '32px' }}>
        <div className="skeleton skeleton-text large skeleton-mb-2" style={{ width: '25%' }} />
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
              <div className="skeleton-flex" style={{ flex: 1 }}>
                <div className="skeleton skeleton-avatar" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text skeleton-mb-1" style={{ width: '60%' }} />
                  <div className="skeleton skeleton-text small" style={{ width: '40%' }} />
                </div>
              </div>
              <div className="skeleton skeleton-badge" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSectionSkeleton;
