import { useState, useEffect, useCallback } from 'react';
import { useAuthOptimized } from '../../../../../hooks/useAuthOptimized';
import { useWebSocket } from '../../../../../hooks/useWebSocket';
import pedidosService from '../../../../../services/pedidosService';
import { PedidoWithDetails, OrdersStats } from '../types';

export const useOrders = () => {
  const { user } = useAuthOptimized();
  const { socket, isConnected } = useWebSocket();
  const [orders, setOrders] = useState<PedidoWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OrdersStats>({
    total: 0,
    pendientesConfirmacion: 0,
    confirmados: 0,
    noConfirmados: 0,
    enProceso: 0,
    esperandoDelivery: 0,
    enCamino: 0,
    entregados: 0,
    esperandoRetiro: 0
  });

  const loadOrders = useCallback(async () => {
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
  }, [user]);

  // Cargar pedidos al montar el componente
  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user?.id, loadOrders]);

  // Escuchar actualizaciones en tiempo real de pedidos
  useEffect(() => {
    if (!socket || !isConnected || !user?.id) return;

    console.log('🔌 [ORDERS HOOK] Configurando listeners de WebSocket para actualizaciones de pedidos');

    const handlePedidoActualizado = (data: any) => {
      console.log('📨 [ORDERS HOOK] Pedido actualizado recibido:', data);

      // Actualizar el pedido en la lista local
      setOrders(prevOrders => {
        const orderIndex = prevOrders.findIndex(o => o.id === data.pedidoId);
        if (orderIndex !== -1) {
          const updatedOrders = [...prevOrders];
          updatedOrders[orderIndex] = {
            ...updatedOrders[orderIndex],
            ...data.pedido,
            estado: data.nuevoEstado
          };
          console.log('✅ [ORDERS HOOK] Pedido actualizado en lista local');
          return updatedOrders;
        }
        return prevOrders;
      });

      // Recargar estadísticas
      if (user?.id) {
        pedidosService.getPedidosStats(user.id).then(newStats => {
          setStats(newStats);
          console.log('📊 [ORDERS HOOK] Estadísticas actualizadas');
        });
      }
    };

    socket.on('pedido_actualizado', handlePedidoActualizado);

    return () => {
      console.log('🚫 [ORDERS HOOK] Removiendo listeners de WebSocket');
      socket.off('pedido_actualizado', handlePedidoActualizado);
    };
  }, [socket, isConnected, user?.id]);

  const handleUpdateOrderStatus = async (
    pedidoId: string, 
    newStatus: 'pendiente_confirmacion' | 'confirmado' | 'en_proceso' | 'esperando_delivery' | 'en_camino' | 'entregado' | 'esperando_retiro'
  ) => {
    try {

      
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

      // Las notificaciones se envían automáticamente desde el backend
      
      console.log('✅ [ORDERS HOOK] Estado del pedido actualizado exitosamente');
    } catch (err: any) {
      console.error('❌ [ORDERS HOOK] Error al actualizar estado del pedido:', err);
      throw err;
    }
  };

  const handleRejectOrder = async (pedidoId: string, motivo?: string) => {
    try {
      console.log('🔄 [ORDERS HOOK] Rechazando pedido:', pedidoId, motivo);
      
      const updatedOrder = await pedidosService.rejectPedido(pedidoId, motivo);
      
      // Actualizar la lista local
      setOrders(orders.map(order =>
        order.id === pedidoId ? updatedOrder : order
      ));
      
      // Recargar estadísticas
      if (user?.id) {
        const newStats = await pedidosService.getPedidosStats(user.id);
        setStats(newStats);
      }
      
      console.log('✅ [ORDERS HOOK] Pedido rechazado exitosamente');
    } catch (err: any) {
      console.error('❌ [ORDERS HOOK] Error al rechazar pedido:', err);
      alert(err.message || 'Error al rechazar pedido');
    }
  };

  const handleDeleteOrder = async (pedidoId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
      try {
        console.log('🔄 [ORDERS HOOK] Eliminando pedido:', pedidoId);
        
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
    handleRejectOrder,
    handleDeleteOrder,
    getFilteredOrders
  };
};
