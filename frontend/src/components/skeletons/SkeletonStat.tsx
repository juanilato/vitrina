import React from 'react';
import './SkeletonBase.css';

interface SkeletonStatProps {
  variant?: 'card' | 'inline';
  hasIcon?: boolean;
  hasTrend?: boolean;
  className?: string;
}

/**
 * Componente de skeleton para tarjetas de estadísticas
 * Usado en: StatsSection
 */
export const SkeletonStat: React.FC<SkeletonStatProps> = ({
  variant = 'card',
  hasIcon = true,
  hasTrend = true,
  className = '',
}) => {
  if (variant === 'inline') {
    return (
      <div className={`skeleton-flex ${className}`} style={{ justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-text small skeleton-mb-1" style={{ width: '50%' }} />
          <div className="skeleton skeleton-text large" style={{ width: '70%' }} />
        </div>
        {hasIcon && <div className="skeleton skeleton-icon large" />}
      </div>
    );
  }

  return (
    <div className={`skeleton-stat-card ${className}`}>
      <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
        <div className="skeleton skeleton-text small" style={{ width: '60%' }} />
        {hasIcon && <div className="skeleton skeleton-icon" />}
      </div>

      <div className="skeleton skeleton-text" style={{ width: '40%', height: '32px', marginBottom: '8px' }} />

      {hasTrend && (
        <div className="skeleton-flex" style={{ gap: '8px' }}>
          <div className="skeleton skeleton-icon small" />
          <div className="skeleton skeleton-text small" style={{ width: '35%' }} />
        </div>
      )}
    </div>
  );
};

export default SkeletonStat;
