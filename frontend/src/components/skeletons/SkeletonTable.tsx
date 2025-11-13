import React from 'react';
import './SkeletonBase.css';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
  hasActions?: boolean;
  className?: string;
}

/**
 * Componente de skeleton para tablas
 * Usado en: IngredientsSection, RepartidoresTab, etc.
 */
export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  hasHeader = true,
  hasActions = true,
  className = '',
}) => {
  const columnWidths = Array.from({ length: columns }, (_, i) => {
    if (i === 0) return '30%';
    if (i === columns - 1 && hasActions) return '15%';
    return `${70 / (columns - 1)}%`;
  });

  return (
    <div className={`skeleton-table ${className}`}>
      {hasHeader && (
        <div className="skeleton-table-row" style={{ borderBottom: '2px solid #e0e0e0' }}>
          {columnWidths.map((width, index) => (
            <div key={index} className="skeleton-table-cell" style={{ width }}>
              <div className="skeleton skeleton-text" style={{ width: '80%', height: '14px' }} />
            </div>
          ))}
        </div>
      )}

      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {columnWidths.map((width, colIndex) => (
            <div key={colIndex} className="skeleton-table-cell" style={{ width }}>
              {colIndex === columns - 1 && hasActions ? (
                <div className="skeleton-flex" style={{ gap: '8px' }}>
                  <div className="skeleton skeleton-icon" />
                  <div className="skeleton skeleton-icon" />
                </div>
              ) : (
                <div
                  className="skeleton skeleton-text"
                  style={{
                    width: `${60 + Math.random() * 30}%`,
                    height: colIndex === 0 ? '16px' : '14px'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SkeletonTable;
