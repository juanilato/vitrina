import api from '../config/axios.config';

export interface PromocionConfig {
    cantidadCompra?: number;
    porcentajeDescuento?: number;
    diasAplicables?: number[]; // 0=Domingo, 1=Lunes, ..., 6=Sábado
    horaInicio?: number; // Minutos desde medianoche
    horaFin?: number; // Minutos desde medianoche (puede ser > 1440 si cruza medianoche)
    cantidadPaga?: number;
    cantidadLleva?: number;
}

export interface Promocion {
    id: string;
    nombre: string;
    descripcion?: string;
    tipo: 'CANTIDAD' | 'DIA' | 'BXPY';
    configuracion: PromocionConfig;
    alcance: 'TODOS' | 'SELECCIONADOS';
    activo: boolean;
    empresaId: string;
    productos?: { producto: any }[];
}

export const promotionsService = {
    /**
     * Obtiene todas las promociones de una empresa
     */
    getByEmpresa: async (empresaId: string): Promise<Promocion[]> => {
        const response = await api.get<Promocion[]>(`/promociones/empresa/${empresaId}`);
        return response.data;
    },

    /**
     * Obtiene solo las promociones activas de una empresa
     * El backend ya filtra por día y horario (incluyendo horarios que cruzan medianoche)
     */
    getActiveByEmpresa: async (empresaId: string): Promise<Promocion[]> => {
        const response = await api.get<Promocion[]>(`/promociones/empresa/${empresaId}/activas`);
        return response.data;
    }
};
