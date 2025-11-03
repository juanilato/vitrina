/**
 * useActiveOrder Hook
 * Hook para obtener el pedido activo del usuario
 */

import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/order.service';
import { PedidoWithDetails, OrderStatus } from '../types/order';
import { useAuth } from '../contexts/AuthContext';
import { websocketService } from '../services/websocket.service';

// Estados que se consideran "activos"
const ACTIVE_STATES: OrderStatus[] = [
  'pendiente_confirmacion',
  'confirmado',
  'en_proceso',
  'esperando_delivery',
  'en_camino',
  'esperando_retiro',
];

export const useActiveOrder = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [activeOrder, setActiveOrder] = useState<PedidoWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveOrder = useCallback(async () => {
    try {
      // Esperar a que la autenticación termine de cargar
      if (authLoading) {
        console.log('[useActiveOrder] Waiting for auth to load...');
        return;
      }

      if (!user?.email) {
        console.log('[useActiveOrder] No user email, clearing active order');
        setActiveOrder(null);
        setLoading(false);
        return;
      }

      console.log('[useActiveOrder] Fetching active order for:', user.email);
      setLoading(true);
      setError(null);

      // Obtener todos los pedidos del usuario
      const orders = await orderService.getMyOrders(user.email);

      // Filtrar pedidos activos
      const activeOrders = orders.filter((order) =>
        ACTIVE_STATES.includes(order.estado)
      );

      // Ordenar por fecha de creación (más reciente primero)
      activeOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      // Tomar el pedido más reciente
      const mostRecentActiveOrder = activeOrders.length > 0 ? activeOrders[0] : null;

      console.log('[useActiveOrder] Active order found:', mostRecentActiveOrder ? mostRecentActiveOrder.id : 'none');
      setActiveOrder(mostRecentActiveOrder);
    } catch (err: any) {
      console.error('[useActiveOrder] Error fetching active order:', err);
      setError(err.response?.data?.message || 'No se pudo cargar el pedido activo');
      setActiveOrder(null);
    } finally {
      setLoading(false);
    }
  }, [user?.email, authLoading]);

  useEffect(() => {
    fetchActiveOrder();
  }, [fetchActiveOrder]);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    if (!user?.email) return;

    // Handler for order updates
    const handleOrderUpdate = (data: any) => {
      console.log('Order updated via WebSocket:', data);
      // Refresh active order when an order is updated
      fetchActiveOrder();
    };

    // Handler for new notifications
    const handleNewNotification = (notification: any) => {
      // If notification is about an order, refresh active order
      if (notification.type === 'order_created' || notification.type === 'order_updated') {
        fetchActiveOrder();
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
  }, [user?.email, fetchActiveOrder]);

  const refresh = useCallback(() => {
    fetchActiveOrder();
  }, [fetchActiveOrder]);

  return {
    activeOrder,
    loading,
    error,
    refresh,
    hasActiveOrder: activeOrder !== null,
  };
};
