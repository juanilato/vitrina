import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export interface Promocion {
    id: string;
    nombre: string;
    descripcion?: string;
    tipo: 'CANTIDAD' | 'DIA' | 'BXPY';
    configuracion: {
        // Para tipo CANTIDAD
        cantidadCompra?: number; // Ej: 2 (Llevando 2...)
        porcentajeDescuento?: number; // Ej: 10 (10% de descuento)

        // Para tipo DIA
        diasAplicables?: number[]; // 0=Domingo, 1=Lunes, etc.

        // Para tipo BXPY
        cantidadPaga?: number; // Ej: 1 (Paga 1)
        cantidadLleva?: number; // Ej: 2 (Llevando 2)
    };
    alcance: 'TODOS' | 'SELECCIONADOS';
    activo: boolean;
    empresaId: string;
    productos?: { producto: any }[]; // Ajustar tipo según necesidad
}

export interface CreatePromocionDto {
    nombre: string;
    descripcion?: string;
    tipo: 'CANTIDAD' | 'DIA' | 'BXPY';
    configuracion: any;
    alcance: 'TODOS' | 'SELECCIONADOS';
    activo?: boolean;
    productosIds?: string[];
}

const promotionsService = {
    getByEmpresa: async (empresaId: string): Promise<Promocion[]> => {
        const response = await axios.get(`${API_URL}/promociones/empresa/${empresaId}`);
        return response.data;
    },

    create: async (empresaId: string, data: CreatePromocionDto): Promise<Promocion> => {
        const response = await axios.post(`${API_URL}/promociones`, { ...data, empresaId });
        return response.data;
    },

    update: async (id: string, empresaId: string, data: Partial<CreatePromocionDto>): Promise<Promocion> => {
        const response = await axios.patch(`${API_URL}/promociones/${id}`, data);
        return response.data;
    },

    delete: async (id: string, empresaId: string): Promise<void> => {
        await axios.delete(`${API_URL}/promociones/${id}`);
    }
};

export default promotionsService;
