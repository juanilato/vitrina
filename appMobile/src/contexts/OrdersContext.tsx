/**
 * Orders Context
 * Contexto unificado para manejar los pedidos del usuario
 * Reemplaza useOrders y useActiveOrder hooks para evitar duplicación
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { orderService } from '../services/order.service';
import { PedidoWithDetails, OrderStatus } from '../types/order';
import { useAuth } from './AuthContext';
import { websocketService } from '../services/websocket.service';

type OrderFilter = 'all' | 'active' | 'completed' | 'cancelled';

// Estados que se consideran "activos"
const ACTIVE_STATES: OrderStatus[] = [
  'pendiente_confirmacion',
  'confirmado',
  'en_proceso',
  'esperando_delivery',
  'en_camino',
  'esperando_retiro',
];

interface OrdersContextType {
  // Todos los pedidos
  orders: PedidoWithDetails[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => void;

  // Filtrado
  filter: OrderFilter;
  setFilter: (filter: OrderFilter) => void;
  filteredOrders: PedidoWithDetails[];

  // Pedidos activos
  activeOrders: PedidoWithDetails[];
  activeOrdersCount: number;
  mostRecentActiveOrder: PedidoWithDetails | null;
  hasActiveOrder: boolean;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<PedidoWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<OrderFilter>('all');

  const fetchOrders = useCallback(async (isRefreshing = false) => {
    try {
      // Esperar a que la autenticación termine
      if (authLoading) {
        console.log('[OrdersContext] Waiting for auth to load...');
        return;
      }

      if (!user?.email) {
        console.log('[OrdersContext] No user email available');
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

      console.log('[OrdersContext] 📦 Fetching orders for:', user.email);
      const data = await orderService.getMyOrders(user.email);
      console.log('[OrdersContext] ✅ Orders fetched:', data.length);
      setOrders(data);
    } catch (err: any) {
      console.error('[OrdersContext] ❌ Error fetching orders:', err);
      setError(err.response?.data?.message || 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.email, authLoading]);

  // Fetch inicial
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // WebSocket listeners para actualizaciones en tiempo real (ÚNICO LUGAR)
  useEffect(() => {
    if (!user?.email) return;

    // Handler para actualizaciones de pedidos
    const handleOrderUpdate = (data: any) => {
      console.log('[OrdersContext] 🔔 Order updated via WebSocket:', data);
      fetchOrders(true);
    };

    // Handler para nuevas notificaciones
    const handleNewNotification = (notification: any) => {
      console.log('[OrdersContext] 🔔 New notification via WebSocket:', notification);
      if (notification.type === 'order_created' || notification.type === 'order_updated') {
        fetchOrders(true);
      }
    };

    // Suscribirse a eventos WebSocket
    websocketService.on('pedido-actualizado', handleOrderUpdate);
    websocketService.on('new-notification', handleNewNotification);

    // Cleanup al desmontar
    return () => {
      websocketService.off('pedido-actualizado', handleOrderUpdate);
      websocketService.off('new-notification', handleNewNotification);
    };
  }, [user?.email, fetchOrders]);

  const refresh = useCallback(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  // Calcular pedidos activos
  const activeOrders = orders.filter((order) =>
    ACTIVE_STATES.includes(order.estado)
  );

  // Pedido activo más reciente
  const mostRecentActiveOrder = activeOrders.length > 0
    ? [...activeOrders].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })[0]
    : null;

  // Filtrar pedidos según el filtro seleccionado
  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ACTIVE_STATES.includes(order.estado);
    if (filter === 'completed') return order.estado === 'entregado';
    if (filter === 'cancelled') return order.estado === 'cancelado';
    return true;
  });

  const value: OrdersContextType = {
    orders,
    loading,
    error,
    refreshing,
    refresh,
    filter,
    setFilter,
    filteredOrders,
    activeOrders,
    activeOrdersCount: activeOrders.length,
    mostRecentActiveOrder,
    hasActiveOrder: mostRecentActiveOrder !== null,
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}

// Hook de compatibilidad para código que usaba useActiveOrder
export function useActiveOrder() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useActiveOrder must be used within an OrdersProvider');
  }
  return {
    activeOrder: context.mostRecentActiveOrder,
    loading: context.loading,
    error: context.error,
    refresh: context.refresh,
    hasActiveOrder: context.hasActiveOrder,
  };
}
