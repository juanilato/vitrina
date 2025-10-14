import React from 'react';
import { ingredientIcons, IngredientIconName } from './Ingredientes';

interface IngredientIconProps {
  name: IngredientIconName;
  size?: number;
  alt?: string;
  className?: string;
}

export const IngredientIcon: React.FC<IngredientIconProps> = ({
  name,
  size = 32,
  alt,
  className = '',
}) => (
  <img
    src={ingredientIcons[name]}
    alt={alt || name}
    width={size}
    height={size}
    className={`ingredient-icon ${className}`}
    style={{ objectFit: 'contain' }}
  />
);
