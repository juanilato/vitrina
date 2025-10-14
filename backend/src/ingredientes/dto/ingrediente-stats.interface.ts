
export interface IngredienteStats {
  total: number;       // Total de tipos de ingredientes únicos
  unidades: number;    // Suma total de stockDisponible
  tiposUnicos: number; // Mismo que 'total' si contamos por tipo
}