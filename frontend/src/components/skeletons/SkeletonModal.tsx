import React from 'react';
import './SkeletonBase.css';

interface SkeletonModalProps {
  /** Tamaño del modal */
  size?: 'small' | 'medium' | 'large';
  /** Muestra sección de imagen */
  hasImage?: boolean;
  /** Muestra lista de items */
  hasItemList?: boolean;
  /** Número de items en la lista */
  itemCount?: number;
  /** Muestra formulario */
  hasForm?: boolean;
  /** Número de campos en el formulario */
  fieldCount?: number;
}

/**
 * Skeleton genérico para modales
 * Configurable para diferentes tipos de contenido
 */
export const SkeletonModal: React.FC<SkeletonModalProps> = ({
  size = 'medium',
  hasImage = false,
  hasItemList = false,
  itemCount = 3,
  hasForm = false,
  fieldCount = 4,
}) => {
  const getWidth = () => {
    switch (size) {
      case 'small': return '400px';
      case 'large': return '800px';
      default: return '600px';
    }
  };

  return (
    <div
      className="skeleton-modal"
      style={{
        width: getWidth(),
        maxWidth: '90vw',
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div className="skeleton skeleton-text large skeleton-mb-1" style={{ width: '60%' }} />
        <div className="skeleton skeleton-text small" style={{ width: '80%' }} />
      </div>

      {/* Contenido */}
      <div style={{ marginBottom: '24px' }}>
        {hasImage && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <div
              className="skeleton skeleton-image wide"
              style={{
                width: '100%',
                height: '200px',
                margin: '0 auto',
                borderRadius: '8px'
              }}
            />
          </div>
        )}

        {hasItemList && (
          <div style={{ marginBottom: '20px' }}>
            {Array.from({ length: itemCount }).map((_, i) => (
              <div
                key={i}
                className="skeleton-flex"
                style={{
                  padding: '12px',
                  borderBottom: i < itemCount - 1 ? '1px solid #e0e0e0' : 'none',
                  gap: '12px'
                }}
              >
                <div className="skeleton skeleton-icon" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text skeleton-mb-1" style={{ width: '70%' }} />
                  <div className="skeleton skeleton-text small" style={{ width: '50%' }} />
                </div>
                <div className="skeleton skeleton-text" style={{ width: '60px' }} />
              </div>
            ))}
          </div>
        )}

        {hasForm && (
          <div>
            {Array.from({ length: fieldCount }).map((_, i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div className="skeleton skeleton-text small skeleton-mb-1" style={{ width: '30%' }} />
                <div className="skeleton skeleton-input" />
              </div>
            ))}
          </div>
        )}

        {!hasImage && !hasItemList && !hasForm && (
          <div>
            <div className="skeleton skeleton-text skeleton-mb-2" style={{ width: '100%' }} />
            <div className="skeleton skeleton-text skeleton-mb-2" style={{ width: '95%' }} />
            <div className="skeleton skeleton-text skeleton-mb-2" style={{ width: '90%' }} />
            <div className="skeleton skeleton-text" style={{ width: '85%' }} />
          </div>
        )}
      </div>

      {/* Footer con botones */}
      <div className="skeleton-flex" style={{ justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
        <div className="skeleton skeleton-button" style={{ width: '100px' }} />
        <div className="skeleton skeleton-button" style={{ width: '120px' }} />
      </div>
    </div>
  );
};

export default SkeletonModal;
