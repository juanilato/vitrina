/**
 * Order (Pedido) Service
 */

import api from '../config/axios.config';
import {
  CreateOrderRequest,
  OrdersStats,
  PedidoWithDetails,
} from '../types/order';

export const orderService = {
  /**
   * Create new order
   */
  async createOrder(orderData: CreateOrderRequest): Promise<PedidoWithDetails> {
    const response = await api.post<PedidoWithDetails>('/pedidos', orderData);
    return response.data;
  },

  /**
   * Get all orders for current user (client)
   */
  async getMyOrders(): Promise<PedidoWithDetails[]> {
    const response = await api.get<PedidoWithDetails[]>('/pedidos');
    return response.data;
  },

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<PedidoWithDetails> {
    const response = await api.get<PedidoWithDetails>(`/pedidos/${orderId}`);
    return response.data;
  },

  /**
   * Get transfer photo for order
   */
  async getTransferenciaFoto(orderId: string): Promise<Blob> {
    const response = await api.get(`/pedidos/${orderId}/transferencia-foto`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Calculate shipping price
   */
  async calculateShippingPrice(
    empresaId: string,
    data: {
      clienteLat: number;
      clienteLng: number;
      ubicacionId?: string;
    }
  ) {
    const response = await api.post(
      `/empresas/${empresaId}/calcular-precio-envio`,
      data
    );
    return response.data;
  },
};
