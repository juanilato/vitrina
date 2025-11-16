import React from 'react';
import { Text } from 'react-native';

// Emoji por defecto para ingredientes
export const DEFAULT_EMOJI = '🥬';

// Componente genérico que renderiza emojis de ingredientes
export const RenderIngredientIcon: React.FC<{ name?: string; size?: number }> = ({ name, size = 22 }) => {
  if (!name) {
    return (
      <Text style={{ fontSize: size }}>
        {DEFAULT_EMOJI}
      </Text>
    );
  }

  // Los emojis son cadenas de texto unicode, simplemente los renderizamos
  return (
    <Text style={{ fontSize: size }}>
      {name}
    </Text>
  );
};