import React from 'react';
import './CategoryCard.css';

export interface CategoryCardProps {
  id: string;
  nombre: string;
  icono?: string;
  onPress: (id: string, nombre: string) => void;
  variant?: 'normal' | 'wide' | 'tall';
}

// 12 colores de gradiente como en la app mobile
const GRADIENT_COLORS = [
  ['#667eea', '#764ba2'], // Morado
  ['#f093fb', '#f5576c'], // Rosa
  ['#4facfe', '#00f2fe'], // Azul claro
  ['#43e97b', '#38f9d7'], // Verde agua
  ['#fa709a', '#fee140'], // Rosa-Amarillo
  ['#30cfd0', '#330867'], // Azul-Morado
  ['#a8edea', '#fed6e3'], // Pastel
  ['#ff9a56', '#ff6a88'], // Naranja-Rosa
  ['#ffecd2', '#fcb69f'], // Melocotón
  ['#ff6e7f', '#bfe9ff'], // Rosa-Azul
  ['#e0c3fc', '#8ec5fc'], // Lila-Azul
  ['#f8b500', '#fceabb'], // Dorado
];

// Función para obtener el color basado en el ID (hash simple)
const getGradientForId = (id: string): string[] => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_COLORS.length;
  return GRADIENT_COLORS[index];
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  nombre,
  icono = '📦',
  onPress,
  variant = 'normal',
}) => {
  const [startColor, endColor] = getGradientForId(id);

  const handleClick = () => {
    onPress(id, nombre);
  };

  return (
    <div
      className={`category-card category-card-${variant}`}
      style={{
        background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
      }}
      onClick={handleClick}
    >
      <div className="category-card-icon">{icono}</div>
      <div className="category-card-name">{nombre}</div>
    </div>
  );
};
