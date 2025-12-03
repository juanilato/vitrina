import api from '../config/axios.config';

export interface Promocion {
    id: string;
    nombre: string;
    descripcion?: string;
    tipo: 'CANTIDAD' | 'DIA' | 'BXPY';
    configuracion: {
        cantidadCompra?: number;
        porcentajeDescuento?: number;
        diasAplicables?: number[];
        cantidadPaga?: number;
        cantidadLleva?: number;
    };
    alcance: 'TODOS' | 'SELECCIONADOS';
    activo: boolean;
    empresaId: string;
    productos?: { producto: any }[];
}

export const promotionsService = {
    getByEmpresa: async (empresaId: string): Promise<Promocion[]> => {
        const response = await api.get<Promocion[]>(`/promociones/empresa/${empresaId}`);
        return response.data;
    }
};
