import axiosInstance from '../config/axios.config';
import { PedidoWithDetails, CreatePedidoDto, UpdatePedidoDto, OrdersStats } from '../components/dashboard/sections/OrdersSection/types';

class PedidosService {
  private baseURL = '/pedidos';

  // Obtener todos los pedidos de una empresa
  async getPedidosByEmpresa(empresaId: string): Promise<PedidoWithDetails[]> {
    try {
      console.log('🔄 [PEDIDOS SERVICE] Obteniendo pedidos para empresa:', empresaId);
      
      const response = await axiosInstance.get(`${this.baseURL}/empresa/${empresaId}`);
      
      console.log('✅ [PEDIDOS SERVICE] Pedidos obtenidos exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PEDIDOS SERVICE] Error al obtener pedidos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener pedidos');
    }
  }

  // Obtener un pedido por ID
  async getPedidoById(pedidoId: string): Promise<PedidoWithDetails> {
    try {
      console.log('🔄 [PEDIDOS SERVICE] Obteniendo pedido:', pedidoId);
      
      const response = await axiosInstance.get(`${this.baseURL}/${pedidoId}`);
      
      console.log('✅ [PEDIDOS SERVICE] Pedido obtenido exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PEDIDOS SERVICE] Error al obtener pedido:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener pedido');
    }
  }

  // Crear un nuevo pedido (para clientes)
  async createPedido(pedidoData: CreatePedidoDto): Promise<PedidoWithDetails> {
    try {
      console.log('🔄 [PEDIDOS SERVICE] Creando pedido:', pedidoData);

      const response = await axiosInstance.post(this.baseURL, pedidoData);

      console.log('✅ [PEDIDOS SERVICE] Pedido creado exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PEDIDOS SERVICE] Error al crear pedido:', error);
      throw new Error(error.response?.data?.message || 'Error al crear pedido');
    }
  }

  // Crear un pedido local (desde el restaurante)
  async createLocalOrder(orderData: {
    empresaId: string;
    nombreClienteLocal?: string;
    mesaNumero?: string;
    items: Array<{
      productoId: string;
      cantidad: number;
      precio: number;
      notas?: string;
      ingredientesExtras?: Array<{
        productoIngredienteId: number;
        cantidad: number;
      }>;
    }>;
    formaPago: 'transferencia' | 'efectivo';
  }): Promise<PedidoWithDetails> {
    try {
      console.log('🔄 [PEDIDOS SERVICE] Creando pedido local:', orderData);

      const pedidoData = {
        ...orderData,
        origenPedido: 'local',
        tipoEntrega: 'retiro', // Los pedidos locales son siempre "retiro" (consumen en el local)
      };

      const response = await axiosInstance.post(`${this.baseURL}/empresa/local`, pedidoData);

      console.log('✅ [PEDIDOS SERVICE] Pedido local creado exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PEDIDOS SERVICE] Error al crear pedido local:', error);
      throw new Error(error.response?.data?.message || 'Error al crear pedido local');
    }
  }

  // Actualizar estado de un pedido
  async updatePedido(pedidoId: string, updateData: UpdatePedidoDto): Promise<PedidoWithDetails> {
    try {
      console.log('🔄 [PEDIDOS SERVICE] Actualizando pedido:', pedidoId, updateData);
      
      const response = await axiosInstance.patch(`${this.baseURL}/${pedidoId}`, updateData);
      
      console.log('✅ [PEDIDOS SERVICE] Pedido actualizado exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PEDIDOS SERVICE] Error al actualizar pedido:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar pedido');
    }
  }

  // Rechazar un pedido (cambia estado a no_confirmado)
  async rejectPedido(pedidoId: string, motivo?: string): Promise<PedidoWithDetails> {
    try {
      console.log('🔄 [PEDIDOS SERVICE] Rechazando pedido:', pedidoId, motivo);
      
      const response = await axiosInstance.patch(`${this.baseURL}/${pedidoId}/reject`, {
        motivo
      });
      
      console.log('✅ [PEDIDOS SERVICE] Pedido rechazado exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PEDIDOS SERVICE] Error al rechazar pedido:', error);
      throw new Error(error.response?.data?.message || 'Error al rechazar pedido');
    }
  }

  // Eliminar un pedido
  async deletePedido(pedidoId: string): Promise<void> {
    try {
      console.log('🔄 [PEDIDOS SERVICE] Eliminando pedido:', pedidoId);
      
      await axiosInstance.delete(`${this.baseURL}/${pedidoId}`);
      
      console.log('✅ [PEDIDOS SERVICE] Pedido eliminado exitosamente');
    } catch (error: any) {
      console.error('❌ [PEDIDOS SERVICE] Error al eliminar pedido:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar pedido');
    }
  }

  // Obtener estadísticas de pedidos
  async getPedidosStats(empresaId: string): Promise<OrdersStats> {
    try {
      console.log('🔄 [PEDIDOS SERVICE] Obteniendo estadísticas para empresa:', empresaId);
      
      const response = await axiosInstance.get(`${this.baseURL}/stats/${empresaId}`);
      
      console.log('✅ [PEDIDOS SERVICE] Estadísticas obtenidas exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PEDIDOS SERVICE] Error al obtener estadísticas:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }

  // Obtener foto de transferencia de un pedido
  async getTransferenciaFoto(pedidoId: string): Promise<{ base64: string; mimeType: string } | null> {
    try {
      console.log('🔄 [PEDIDOS SERVICE] Obteniendo foto de transferencia para pedido:', pedidoId);
      
      const response = await axiosInstance.get(`${this.baseURL}/${pedidoId}/transferencia-foto`);
      
      if (response.data.error) {
        console.log('ℹ️ [PEDIDOS SERVICE] No se encontró foto de transferencia');
        return null;
      }
      
      console.log('✅ [PEDIDOS SERVICE] Foto de transferencia obtenida exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ [PEDIDOS SERVICE] Error al obtener foto de transferencia:', error);
      return null;
    }
  }

  // Método auxiliar para obtener el color del estado
  getStatusColor(estado: string): string {
    switch (estado) {
      case 'pendiente_confirmacion':
        return '#f59e0b'; // amber
      case 'confirmado':
        return '#8b5cf6'; // purple
      case 'en_proceso':
        return '#3b82f6'; // blue
      case 'esperando_delivery':
        return '#f97316'; // orange
      case 'en_camino':
        return '#06b6d4'; // cyan
      case 'entregado':
        return '#059669'; // emerald
      case 'esperando_retiro':
        return '#84cc16'; // lime
      case 'no_confirmado':
        return '#ef4444'; // red
      case 'cancelado':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  }

  // Método auxiliar para obtener el texto del estado
  getStatusText(estado: string): string {
    switch (estado) {
      case 'pendiente_confirmacion':
        return 'Pendiente de Confirmación';
      case 'confirmado':
        return 'Confirmado';
      case 'en_proceso':
        return 'En Proceso';
      case 'esperando_delivery':
        return 'Esperando Delivery';
      case 'en_camino':
        return 'En Camino';
      case 'entregado':
        return 'Entregado';
      case 'esperando_retiro':
        return 'Esperando Retiro';
      case 'no_confirmado':
        return 'No Confirmado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  }

  // Método para obtener el siguiente estado según el tipo de entrega
  getNextStatus(currentStatus: string, tipoEntrega: 'delivery' | 'retiro'): string | null {
    if (tipoEntrega === 'delivery') {
      // Flujo para delivery: pendiente_confirmacion -> confirmado -> en_proceso -> esperando_delivery -> en_camino -> entregado
      switch (currentStatus) {
        case 'pendiente_confirmacion':
          return 'confirmado';
        case 'confirmado':
          return 'en_proceso';
        case 'en_proceso':
          return 'esperando_delivery';
        case 'esperando_delivery':
          return 'en_camino';
        case 'en_camino':
          return 'entregado';
        default:
          return null;
      }
    } else {
      // Flujo para retiro: pendiente_confirmacion -> confirmado -> en_proceso -> esperando_retiro -> entregado
      switch (currentStatus) {
        case 'pendiente_confirmacion':
          return 'confirmado';
        case 'confirmado':
          return 'en_proceso';
        case 'en_proceso':
          return 'esperando_retiro';
        case 'esperando_retiro':
          return 'entregado';
        default:
          return null;
      }
    }
  }

  // Método para obtener el texto del siguiente estado
  getNextStatusText(currentStatus: string, tipoEntrega: 'delivery' | 'retiro'): string | null {
    const nextStatus = this.getNextStatus(currentStatus, tipoEntrega);
    if (!nextStatus) return null;
    return this.getStatusText(nextStatus);
  }
}

const pedidosService = new PedidosService();
export default pedidosService;
