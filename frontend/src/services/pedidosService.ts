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

  // Método auxiliar para obtener el color del estado
  getStatusColor(estado: string): string {
    switch (estado) {
      case 'pendiente_confirmacion':
        return '#f59e0b'; // amber
      case 'confirmado':
        return '#8b5cf6'; // purple
      case 'en_proceso':
        return '#3b82f6'; // blue
      case 'listo':
        return '#10b981'; // green
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
      case 'listo':
        return 'Listo';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  }
}

const pedidosService = new PedidosService();
export default pedidosService;
