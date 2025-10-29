import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../config/axios.config';
import { useWebSocket } from '../../../../hooks/useWebSocket';
import './RepartidorOrdersSection.css';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

interface MiPedido {
  id: string;
  empresaName: string;
  clienteName: string;
  tipoEntrega: string;
  direccion: string;
  total: number;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

const RepartidorOrdersSection: React.FC = () => {
  const [pedidos, setPedidos] = useState<MiPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  const { on, off, isConnected } = useWebSocket({
    autoConnect: true,
  });

  const cargarMisPedidos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/repartidores/mis-pedidos');
      setPedidos(response.data);
      setError('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar mis pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMisPedidos();
  }, []);

  useEffect(() => {
    // Solo configurar listeners cuando el WebSocket esté conectado
    if (!isConnected) return;

    // Escuchar nuevos pedidos asignados
    const handlePedidoAsignado = (data: any) => {
      console.log('[MisPedidos] Nuevo pedido asignado:', data);
      setNotification(`Nuevo pedido asignado de ${data.empresaName}`);
      cargarMisPedidos();

      setTimeout(() => setNotification(''), 5000);
    };

    // Escuchar cambios de estado de pedidos
    const handleEstadoPedidoActualizado = (data: any) => {
      console.log('[MisPedidos] Estado de pedido actualizado:', data);
      cargarMisPedidos();
    };

    on('pedido_asignado', handlePedidoAsignado);
    on('estado_pedido_actualizado', handleEstadoPedidoActualizado);

    return () => {
      off('pedido_asignado', handlePedidoAsignado);
      off('estado_pedido_actualizado', handleEstadoPedidoActualizado);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]); // Solo depende de isConnected. on/off son estables

  const handleActualizarEstado = async (pedidoId: string, nuevoEstado: string) => {
    try {
      await axiosInstance.patch(`/repartidores/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
      window.alert('Estado actualizado correctamente');
      cargarMisPedidos();
    } catch (err: any) {
      window.alert(err?.response?.data?.message || 'Error al actualizar el estado');
    }
  };

  if (loading) {
    return (
      <div className="mis-pedidos-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando mis pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mis-pedidos-section">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Error</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={cargarMisPedidos}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-pedidos-section">
      <div className="section-header">
        <div className="header-content">
          <h2>Mis Pedidos</h2>
          {isConnected && <span className="ws-status connected">● En vivo</span>}
          {!isConnected && <span className="ws-status disconnected">○ Sin conexión</span>}
        </div>
        <button className="btn-secondary" onClick={cargarMisPedidos}>
          🔄 Actualizar
        </button>
      </div>

      {notification && (
        <div className="alert alert-info with-animation">
          <NotificationsActiveIcon className="alert-icon" />
          {notification}
        </div>
      )}

      {pedidos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No tenés pedidos activos</h3>
          <p>Visitá la sección "Pedidos Disponibles" para tomar un pedido</p>
        </div>
      ) : (
        <div className="pedidos-list">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="pedido-item">
              <div className="pedido-item-header">
                <div className="pedido-empresa">{pedido.empresaName}</div>
                <span className={`estado-badge ${pedido.estado}`}>{pedido.estado}</span>
              </div>
              <div className="pedido-item-body">
                <div className="pedido-info">
                  <div className="info-group">
                    <span className="info-label">Cliente:</span>
                    <span className="info-value">{pedido.clienteName}</span>
                  </div>
                  {pedido.tipoEntrega === 'delivery' && (
                    <div className="info-group">
                      <span className="info-label">📍 Dirección:</span>
                      <span className="info-value">{pedido.direccion}</span>
                    </div>
                  )}
                  <div className="info-group">
                    <span className="info-label">Total:</span>
                    <span className="info-value total">${pedido.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="pedido-actions">
                  {pedido.estado === 'esperando_delivery' && (
                    <button 
                      className="btn-update-state"
                      onClick={() => handleActualizarEstado(pedido.id, 'en_camino')}
                    >
                      Marcar en Camino
                    </button>
                  )}
                  {pedido.estado === 'en_camino' && (
                    <button 
                      className="btn-update-state success"
                      onClick={() => handleActualizarEstado(pedido.id, 'entregado')}
                    >
                      Marcar Entregado
                    </button>
                  )}
                </div>
              </div>
              <div className="pedido-item-footer">
                <span className="fecha">Creado: {new Date(pedido.createdAt).toLocaleString('es-AR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepartidorOrdersSection;
