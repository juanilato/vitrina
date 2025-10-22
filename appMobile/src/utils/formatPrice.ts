/**
 * Formatea un número como precio en formato argentino
 * Evita problemas con toLocaleString en React Native
 */
export const formatPrice = (price: number | string | undefined | null): string => {
  // Convertir a número si viene como string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  // Asegurarse de que el precio es un número válido
  if (numPrice === null || numPrice === undefined || isNaN(numPrice)) {
    return '0,00';
  }

  // Redondear a 2 decimales
  const rounded = Math.round(numPrice * 100) / 100;

  // Separar parte entera y decimal
  const [integer, decimal] = rounded.toFixed(2).split('.');

  // Agregar separador de miles (punto en Argentina)
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Retornar con coma decimal
  return `${formattedInteger},${decimal}`;
};
