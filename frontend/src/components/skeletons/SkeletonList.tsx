import React from 'react';
import './SkeletonBase.css';

interface SkeletonListProps {
  items?: number;
  hasAvatar?: boolean;
  hasIcon?: boolean;
  hasBadge?: boolean;
  lines?: number;
  className?: string;
}

/**
 * Componente de skeleton para listas
 * Usado en: NotificationsSection, VinculacionSection, etc.
 */
export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  hasAvatar = false,
  hasIcon = false,
  hasBadge = false,
  lines = 2,
  className = '',
}) => {
  return (
    <div className={`skeleton-list ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="skeleton-list-item"
          style={{
            display: 'flex',
            gap: '16px',
            padding: '16px',
            borderBottom: '1px solid #e0e0e0',
            alignItems: 'flex-start',
          }}
        >
          {hasAvatar && <div className="skeleton skeleton-avatar" />}
          {hasIcon && <div className="skeleton skeleton-icon large" />}

          <div style={{ flex: 1 }}>
            <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
              <div className="skeleton skeleton-text" style={{ width: '40%', height: '18px' }} />
              {hasBadge && <div className="skeleton skeleton-badge" />}
            </div>

            {Array.from({ length: lines }).map((_, lineIndex) => (
              <div
                key={lineIndex}
                className="skeleton skeleton-text small skeleton-mb-1"
                style={{ width: `${85 - lineIndex * 20}%` }}
              />
            ))}

            <div className="skeleton skeleton-text small" style={{ width: '30%', marginTop: '8px' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonList;
