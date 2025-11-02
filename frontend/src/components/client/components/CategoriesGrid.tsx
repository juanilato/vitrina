import React from 'react';
import { CategoryCard } from './CategoryCard';
import './CategoriesGrid.css';

export interface Category {
  id: string;
  nombre: string;
  icono?: string;
}

interface CategoriesGridProps {
  categories: Category[];
  onCategoryClick: (id: string, nombre: string) => void;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  onCategoryClick,
}) => {
  // Patrón de variantes alternado: normal, normal, wide, normal, normal, wide...
  const getVariant = (index: number): 'normal' | 'wide' | 'tall' => {
    const pattern = index % 5;
    if (pattern === 2) return 'wide'; // Cada tercera carta es wide
    return 'normal';
  };

  return (
    <div className="categories-grid">
      {categories.map((category, index) => (
        <CategoryCard
          key={category.id}
          id={category.id}
          nombre={category.nombre}
          icono={category.icono}
          onPress={onCategoryClick}
          variant={getVariant(index)}
        />
      ))}
    </div>
  );
};
