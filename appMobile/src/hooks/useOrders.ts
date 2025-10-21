/**
 * useOrders Hook
 * Hook para manejar el listado de pedidos del usuario
 */

import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/order.service';
import { PedidoWithDetails } from '../types/order';

type OrderFilter = 'all' | 'active' | 'completed' | 'cancelled';

export const useOrders = () => {
  const [orders, setOrders] = useState<PedidoWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<OrderFilter>('all');

  const fetchOrders = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const refresh = useCallback(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  // Filtrar pedidos según el filtro seleccionado
  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;

    if (filter === 'active') {
      return ['pendiente', 'confirmado', 'preparando', 'en_camino'].includes(order.estado);
    }

    if (filter === 'completed') {
      return order.estado === 'entregado';
    }

    if (filter === 'cancelled') {
      return order.estado === 'cancelado';
    }

    return true;
  });

  // Contar pedidos activos (para badge en tab)
  const activeOrdersCount = orders.filter((order) =>
    ['pendiente', 'confirmado', 'preparando', 'en_camino'].includes(order.estado)
  ).length;

  return {
    orders: filteredOrders,
    allOrders: orders,
    loading,
    error,
    refreshing,
    refresh,
    filter,
    setFilter,
    activeOrdersCount,
  };
};
