/**
 * useOrders Hook
 * Hook para manejar el listado de pedidos del usuario
 */

import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/order.service';
import { PedidoWithDetails } from '../types/order';
import { useAuth } from '../contexts/AuthContext';
import { websocketService } from '../services/websocket.service';

type OrderFilter = 'all' | 'active' | 'completed' | 'cancelled';

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PedidoWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<OrderFilter>('all');

  const fetchOrders = useCallback(async (isRefreshing = false) => {
    try {
      if (!user?.email) {
        console.log('No user email available');
        setOrders([]);
        setLoading(false);
        return;
      }

      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('📦 Fetching orders for:', user.email);
      const data = await orderService.getMyOrders(user.email);
      console.log('✅ Orders fetched:', data.length);
      setOrders(data);
    } catch (err: any) {
      console.error('❌ Error fetching orders:', err);
      setError(err.response?.data?.message || 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    if (!user?.email) return;

    // Handler for order updates
    const handleOrderUpdate = (data: any) => {
      console.log('🔔 Order updated via WebSocket:', data);
      // Refresh orders when an order is updated
      fetchOrders(true);
    };

    // Handler for new notifications
    const handleNewNotification = (notification: any) => {
      console.log('🔔 New notification via WebSocket:', notification);
      // If notification is about an order, refresh orders
      if (notification.type === 'order_created' || notification.type === 'order_updated') {
        fetchOrders(true);
      }
    };

    // Subscribe to WebSocket events
    websocketService.on('pedido-actualizado', handleOrderUpdate);
    websocketService.on('new-notification', handleNewNotification);

    // Cleanup listeners on unmount
    return () => {
      websocketService.off('pedido-actualizado', handleOrderUpdate);
      websocketService.off('new-notification', handleNewNotification);
    };
  }, [user?.email, fetchOrders]);

  const refresh = useCallback(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  // Filtrar pedidos según el filtro seleccionado
  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;

    if (filter === 'active') {
      return ['pendiente', 'pendiente_confirmacion', 'confirmado', 'preparando', 'en_camino'].includes(order.estado);
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
    ['pendiente', 'pendiente_confirmacion', 'confirmado', 'preparando', 'en_camino'].includes(order.estado)
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
