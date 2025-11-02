import React from 'react';
import './SubcategoryCard.css';

export interface SubcategoryCardProps {
  id: string;
  nombre: string;
  icono?: string;
  empresasCount?: number;
  onPress: (id: string, nombre: string) => void;
}

export const SubcategoryCard: React.FC<SubcategoryCardProps> = ({
  id,
  nombre,
  icono = '🏪',
  empresasCount = 0,
  onPress,
}) => {
  const handleClick = () => {
    onPress(id, nombre);
  };

  return (
    <div className="subcategory-card" onClick={handleClick}>
      <div className="subcategory-icon-container">
        <span className="subcategory-icon">{icono}</span>
      </div>
      <div className="subcategory-info">
        <h3 className="subcategory-name">{nombre}</h3>
        {empresasCount > 0 && (
          <p className="subcategory-count">
            {empresasCount} {empresasCount === 1 ? 'empresa' : 'empresas'}
          </p>
        )}
      </div>
      <div className="subcategory-arrow">→</div>
    </div>
  );
};
