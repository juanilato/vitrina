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

  // Ref para acceder a fetchOrders sin crear dependencias
  const fetchOrdersRef = React.useRef<(isRefreshing?: boolean) => Promise<void>>();

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

  // Actualizar ref cuando fetchOrders cambie
  React.useEffect(() => {
    fetchOrdersRef.current = fetchOrders;
  }, [fetchOrders]);

  // Fetch inicial
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // WebSocket listeners para actualizaciones en tiempo real
  useEffect(() => {
    if (!user?.email) return;

    // Handler para actualizaciones de pedidos (evento específico de pedidos)
    const handleOrderUpdate = (data: any) => {
      console.log('[OrdersContext] 🔔 Order updated via WebSocket:', data);
      // Usar ref para evitar dependencias que causen re-suscripciones
      fetchOrdersRef.current?.(true);
    };

    // Suscribirse SOLO al evento de pedidos
    // NOTA: NO escuchamos 'new-notification' aquí para evitar duplicación
    // Las notificaciones se manejan exclusivamente en NotificationsContext
    websocketService.on('pedido-actualizado', handleOrderUpdate);

    console.log('✅ [OrdersContext] WebSocket listener registered for pedido-actualizado');

    // Cleanup al desmontar
    return () => {
      console.log('🧹 [OrdersContext] Cleaning up WebSocket listener');
      websocketService.off('pedido-actualizado', handleOrderUpdate);
    };
  }, [user?.email]);

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
    switch (filter) {
      case 'all':
        return true;
      case 'active':
        return ACTIVE_STATES.includes(order.estado);
      case 'completed':
        return order.estado === 'entregado';
      case 'cancelled':
        return order.estado === 'cancelado' || order.estado === 'no_confirmado';
      default:
        return true;
    }
  });

  console.log(`[OrdersContext] Filter: ${filter}, Total orders: ${orders.length}, Filtered: ${filteredOrders.length}`);
  if (orders.length > 0) {
    console.log('[OrdersContext] Order states:', orders.map(o => o.estado));
  }

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
