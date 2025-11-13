import React from 'react';
import './SkeletonBase.css';

interface SkeletonFormProps {
  fields?: number;
  hasTextarea?: boolean;
  hasSelect?: boolean;
  hasImageUpload?: boolean;
  hasButtons?: boolean;
  columns?: 1 | 2;
  className?: string;
}

/**
 * Componente de skeleton para formularios
 * Usado en: AccountConfigSection tabs, modales, etc.
 */
export const SkeletonForm: React.FC<SkeletonFormProps> = ({
  fields = 4,
  hasTextarea = false,
  hasSelect = false,
  hasImageUpload = false,
  hasButtons = true,
  columns = 1,
  className = '',
}) => {
  return (
    <div className={`skeleton-form ${className}`}>
      {hasImageUpload && (
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <div className="skeleton skeleton-avatar large" style={{ margin: '0 auto 12px' }} />
          <div className="skeleton skeleton-button small" style={{ margin: '0 auto' }} />
        </div>
      )}

      <div
        className="skeleton-grid"
        style={{
          gridTemplateColumns: columns === 2 ? 'repeat(2, 1fr)' : '1fr',
          gap: '20px',
        }}
      >
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index}>
            <div className="skeleton skeleton-text small skeleton-mb-1" style={{ width: '30%' }} />
            <div className="skeleton skeleton-input" />
          </div>
        ))}

        {hasSelect && (
          <div>
            <div className="skeleton skeleton-text small skeleton-mb-1" style={{ width: '30%' }} />
            <div className="skeleton skeleton-input" />
          </div>
        )}

        {hasTextarea && (
          <div style={{ gridColumn: columns === 2 ? 'span 2' : 'span 1' }}>
            <div className="skeleton skeleton-text small skeleton-mb-1" style={{ width: '30%' }} />
            <div className="skeleton skeleton-input textarea" />
          </div>
        )}
      </div>

      {hasButtons && (
        <div className="skeleton-flex" style={{ gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <div className="skeleton skeleton-button" />
          <div className="skeleton skeleton-button" />
        </div>
      )}
    </div>
  );
};

export default SkeletonForm;
