import { useState, useEffect } from 'react';
import { useAuthOptimized } from '../../../../../hooks/useAuthOptimized';
import pedidosService from '../../../../../services/pedidosService';
import { PedidoWithDetails, OrdersStats } from '../types';

export const useOrders = () => {
  const { user } = useAuthOptimized();
  const [orders, setOrders] = useState<PedidoWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OrdersStats>({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    finalizados: 0
  });

  // Cargar pedidos al montar el componente
  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user?.id]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [ORDERS HOOK] Cargando pedidos para empresa:', user?.id);
      
      const [ordersData, statsData] = await Promise.all([
        pedidosService.getPedidosByEmpresa(user!.id),
        pedidosService.getPedidosStats(user!.id)
      ]);
      
      // Validar que ordersData sea un array
      const validOrdersData = Array.isArray(ordersData) ? ordersData : [];
      
      setOrders(validOrdersData);
      setStats(statsData);
      
      console.log('✅ [ORDERS HOOK] Pedidos cargados exitosamente:', {
        count: validOrdersData.length,
        stats: statsData
      });
    } catch (err: any) {
      console.error('❌ [ORDERS HOOK] Error al cargar pedidos:', err);
      setError(err.message || 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (
    pedidoId: string, 
    newStatus: 'pendiente' | 'en_proceso' | 'finalizado'
  ) => {
    try {
      console.log('🔄 [ORDERS HOOK] Actualizando estado del pedido:', pedidoId, 'a', newStatus);
      
      const updatedOrder = await pedidosService.updatePedido(pedidoId, { estado: newStatus });
      
      // Actualizar la lista local
      setOrders(orders.map(order =>
        order.id === pedidoId ? updatedOrder : order
      ));
      
      // Recargar estadísticas
      if (user?.id) {
        const newStats = await pedidosService.getPedidosStats(user.id);
        setStats(newStats);
      }
      
      console.log('✅ [ORDERS HOOK] Estado del pedido actualizado exitosamente');
    } catch (err: any) {
      console.error('❌ [ORDERS HOOK] Error al actualizar estado del pedido:', err);
      throw err;
    }
  };

  const handleDeleteOrder = async (pedidoId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
      try {
        console.log('🗑️ [ORDERS HOOK] Eliminando pedido:', pedidoId);
        
        await pedidosService.deletePedido(pedidoId);
        
        // Actualizar la lista local
        setOrders(orders.filter(order => order.id !== pedidoId));
        
        // Recargar estadísticas
        if (user?.id) {
          const newStats = await pedidosService.getPedidosStats(user.id);
          setStats(newStats);
        }
        
        console.log('✅ [ORDERS HOOK] Pedido eliminado exitosamente');
      } catch (err: any) {
        console.error('❌ [ORDERS HOOK] Error al eliminar pedido:', err);
        alert(err.message || 'Error al eliminar pedido');
      }
    }
  };

  const getFilteredOrders = (searchTerm: string, statusFilter: string) => {
    return orders.filter(order => {
      // Filtro por término de búsqueda
      const matchesSearch = searchTerm === '' || 
        order.cliente?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.cliente?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por estado
      const matchesStatus = statusFilter === 'todos' || order.estado === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  return {
    orders,
    loading,
    error,
    stats,
    user,
    loadOrders,
    handleUpdateOrderStatus,
    handleDeleteOrder,
    getFilteredOrders
  };
};
