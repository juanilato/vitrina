import React, { JSX } from 'react';
import { Ionicons, MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'react-native';

export const ingredientIcons: Record<string, JSX.Element> = {
  // 🍳 Comida (usamos iconos nativos parecidos a los MUI)
  Restaurant: <Ionicons name="restaurant-outline" size={20} color="#555" />,
  Fastfood: <MaterialCommunityIcons name="food-outline" size={20} color="#555" />,
  LocalDining: <Ionicons name="fast-food-outline" size={20} color="#555" />,
  Egg: <MaterialCommunityIcons name="egg-outline" size={20} color="#555" />,
  BakeryDining: <MaterialCommunityIcons name="cupcake" size={20} color="#555" />,
  Icecream: <MaterialCommunityIcons name="ice-cream" size={20} color="#555" />,
  LocalPizza: <MaterialCommunityIcons name="pizza" size={20} color="#555" />,
  RamenDining: <MaterialCommunityIcons name="noodles" size={20} color="#555" />,
  SoupKitchen: <MaterialCommunityIcons name="pot-mix" size={20} color="#555" />,
  RiceBowl: <MaterialCommunityIcons name="rice" size={20} color="#555" />,
  DinnerDining: <MaterialIcons name="dinner-dining" size={20} color="#555" />,
  BrunchDining: <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#555" />,
  // 🌿 Naturales
  Grass: <MaterialCommunityIcons name="grass" size={20} color="#555" />,
  Spa: <MaterialCommunityIcons name="spa-outline" size={20} color="#555" />,
  Forest: <MaterialCommunityIcons name="pine-tree" size={20} color="#555" />,
  Grain: <MaterialCommunityIcons name="grain" size={20} color="#555" />,
  // 🔧 Herramientas
  Build: <MaterialIcons name="build" size={20} color="#555" />,
  ElectricBolt: <MaterialCommunityIcons name="lightning-bolt-outline" size={20} color="#555" />,
};

// 🥦 Para los SVGs que tenés en web/public/ingredients/, en móvil usamos imágenes remotas
const svgBase = 'https://tuservidor.com/ingredients'; // ⚠️ reemplazá por tu base o bucket

export const ingredientSvgIcons: Record<string, string> = {
  banana: `${svgBase}/banana-svgrepo-com.png`,
  broccoli: `${svgBase}/broccoli-outline-svgrepo-com.png`,
  carrot: `${svgBase}/carrot-organic-svgrepo-com.png`,
  cheese: `${svgBase}/cheese-svgrepo-com.png`,
  chickenLeg: `${svgBase}/chicken-leg-svgrepo-com.png`,
  rice: `${svgBase}/rice-svgrepo-com.png`,
  steak: `${svgBase}/steak-meat-svgrepo-com.png`,
  tomato: `${svgBase}/tomato-svgrepo-com.png`,
};

// Componente genérico que devuelve el ícono según nombre
export const RenderIngredientIcon: React.FC<{ name?: string; size?: number }> = ({ name, size = 22 }) => {
  if (!name) return null;

  if (ingredientIcons[name]) return React.cloneElement(ingredientIcons[name], { size });
  if (ingredientSvgIcons[name])
    return (
      <Image
        source={{ uri: ingredientSvgIcons[name] }}
        style={{ width: size, height: size, resizeMode: 'contain' }}
      />
    );

  // Fallback
  return <Ionicons name="help-circle-outline" size={size} color="#aaa" />;
};