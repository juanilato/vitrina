import axiosInstance from '../config/axios.config';

export interface ProductoMasVendido {
  producto: {
    id: string;
    nombre: string;
    precio: number;
    imagenUrl?: string;
  };
  cantidadVendida: number;
  numeroVentas: number;
}

export interface EstadisticasResponse {
  productos: {
    total: number;
    activos: number;
    inactivos: number;
    stockBajo: number;
    sinStock: number;
  };
  pedidos: {
    total: number;
    hoy: number;
    ayer: number;
    ultimos7Dias: number;
    ultimos30Dias: number;
    porEstado: {
      pendiente_confirmacion: number;
      confirmado: number;
      en_proceso: number;
      esperando_delivery: number;
      en_camino: number;
      esperando_retiro: number;
      entregado: number;
      no_confirmado: number;
      cancelado: number;
    };
    tasaExito: number;
    tasaRechazo: number;
  };
  ventas: {
    totales: number;
    hoy: number;
    ultimos7Dias: number;
    ultimos30Dias: number;
    ticketPromedio: number;
  };
  ingredientes: {
    total: number;
    stockBajo: number;
    sinStock: number;
  };
  productosMasVendidos: ProductoMasVendido[];
  repartidores: {
    total: number;
    activos: number;
  };
  tendencias: {
    crecimientoPedidos: number;
    crecimientoVentas: number;
  };
}

const estadisticasService = {
  getEstadisticas: async (empresaId: string): Promise<EstadisticasResponse> => {
    const response = await axiosInstance.get(`/empresas/${empresaId}/estadisticas`);
    return response.data;
  },
};

export default estadisticasService;
