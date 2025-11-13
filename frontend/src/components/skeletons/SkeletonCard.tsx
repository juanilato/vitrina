import React from 'react';
import './SkeletonBase.css';

interface SkeletonCardProps {
  hasImage?: boolean;
  imageAspectRatio?: 'square' | 'wide' | 'default';
  lines?: number;
  hasBadge?: boolean;
  hasButton?: boolean;
  className?: string;
}

/**
 * Componente de skeleton para cards genéricos
 * Usado en: ProductsSection, OrdersSection, etc.
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  hasImage = true,
  imageAspectRatio = 'default',
  lines = 3,
  hasBadge = false,
  hasButton = false,
  className = '',
}) => {
  return (
    <div className={`skeleton-card ${className}`}>
      {hasImage && (
        <div className={`skeleton skeleton-image ${imageAspectRatio} skeleton-mb-2`} />
      )}

      {hasBadge && (
        <div className="skeleton skeleton-badge skeleton-mb-2" />
      )}

      <div className="skeleton skeleton-text title skeleton-mb-2" />

      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton skeleton-text skeleton-mb-1"
          style={{ width: `${Math.max(60, 100 - index * 15)}%` }}
        />
      ))}

      {hasButton && (
        <div className="skeleton skeleton-button wide skeleton-mt-2" />
      )}
    </div>
  );
};

export default SkeletonCard;
