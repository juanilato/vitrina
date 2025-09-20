import { useState, useEffect } from 'react';
import { useAuthOptimized } from '../../../../../hooks/useAuthOptimized';
import { useNotifications } from '../../../../../contexts/NotificationsContext';
import pedidosService from '../../../../../services/pedidosService';
import { PedidoWithDetails, OrdersStats } from '../types';

export const useOrders = () => {
  const { user } = useAuthOptimized();
  const { socket } = useNotifications();
  const [orders, setOrders] = useState<PedidoWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OrdersStats>({
    total: 0,
    pendientesConfirmacion: 0,
    confirmados: 0,
    enProceso: 0,
    listos: 0
  });

  // Cargar pedidos al montar el componente
  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user?.id]);

  // Función para enviar notificación al cliente
  const sendNotificationToClient = async (pedidoId: string, newStatus: string, clienteId: string) => {
    if (!socket) return;

    const statusMessages = {
      'pendiente_confirmacion': {
        titulo: 'Pedido Recibido',
        mensaje: 'Tu pedido ha sido recibido y está pendiente de confirmación.'
      },
      'confirmado': {
        titulo: 'Pedido Confirmado',
        mensaje: 'Tu pedido ha sido confirmado y será procesado pronto.'
      },
      'en_proceso': {
        titulo: 'Pedido en Proceso',
        mensaje: 'Tu pedido está siendo preparado.'
      },
      'listo': {
        titulo: 'Pedido Listo',
        mensaje: '¡Tu pedido está listo para ser entregado!'
      }
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages];
    if (!message) return;

    try {
      // Enviar notificación al cliente a través del WebSocket
      socket.emit('send-notification', {
        clienteId,
        titulo: message.titulo,
        mensaje: message.mensaje,
        tipo: 'pedido_actualizado',
        metadata: {
          pedidoId,
          nuevoEstado: newStatus
        }
      });

      console.log('✅ [ORDERS HOOK] Notificación enviada al cliente:', {
        clienteId,
        pedidoId,
        estado: newStatus
      });
    } catch (error) {
      console.error('❌ [ORDERS HOOK] Error enviando notificación:', error);
    }
  };

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
    newStatus: 'pendiente_confirmacion' | 'confirmado' | 'en_proceso' | 'listo'
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

      // Enviar notificación al cliente
      if (updatedOrder.cliente?.id) {
        await sendNotificationToClient(pedidoId, newStatus, updatedOrder.cliente.id);
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
