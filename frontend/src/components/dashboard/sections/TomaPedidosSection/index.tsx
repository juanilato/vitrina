import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../config/axios.config';
import { useWebSocket } from '../../../../hooks/useWebSocket';
import './TomaPedidosSection.css';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

interface PedidoDisponible {
  id: string;
  clienteName: string;
  empresaName: string;
  empresaId: string;
  tipoEntrega: string;
  direccion: string;
  total: number;
  createdAt: string;
}

const TomaPedidosSection: React.FC = () => {
  const [pedidosDisponibles, setPedidosDisponibles] = useState<PedidoDisponible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nuevoPedidoAlert, setNuevoPedidoAlert] = useState(false);
  const [notification, setNotification] = useState('');

  const { on, off, isConnected } = useWebSocket({
    autoConnect: true,
  });

  const cargarPedidosDisponibles = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/repartidores/pedidos-disponibles');
      setPedidosDisponibles(response.data);
      setError('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar pedidos disponibles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidosDisponibles();
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    // Escuchar nuevos pedidos disponibles
    const handleNuevoPedidoDisponible = (data: any) => {
      console.log('[TomaPedidos] Nuevo pedido disponible:', data);
      setNuevoPedidoAlert(true);
      setNotification(`Nuevo pedido disponible de ${data.empresaName} - $${data.total}`);
      cargarPedidosDisponibles();

      // Quitar notificación después de 5 segundos
      setTimeout(() => {
        setNuevoPedidoAlert(false);
        setNotification('');
      }, 5000);
    };

    const handlePedidoAsignado = (data: any) => {
      console.log('[TomaPedidos] Pedido asignado:', data);
      cargarPedidosDisponibles();
    };

    on('nuevo_pedido_disponible', handleNuevoPedidoDisponible);
    on('pedido_asignado', handlePedidoAsignado);

    return () => {
      off('nuevo_pedido_disponible', handleNuevoPedidoDisponible);
      off('pedido_asignado', handlePedidoAsignado);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]); // Solo depende de isConnected. on/off son estables

  const handleTomarPedido = async (pedidoId: string) => {
    if (!window.confirm('¿Confirmás que querés tomar este pedido?')) {
      return;
    }

    try {
      await axiosInstance.post(`/repartidores/tomar-pedido/${pedidoId}`);
      window.alert('Pedido tomado exitosamente!');
      cargarPedidosDisponibles();
    } catch (err: any) {
      window.alert(err?.response?.data?.message || 'Error al tomar el pedido');
    }
  };

  if (loading) {
    return (
      <div className="toma-pedidos-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando pedidos disponibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="toma-pedidos-section">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Error</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={cargarPedidosDisponibles}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="toma-pedidos-section">
      <div className="section-header">
        <div className="header-content">
          <h2>Pedidos Disponibles</h2>
          {isConnected && <span className="ws-status connected">● En vivo</span>}
          {!isConnected && <span className="ws-status disconnected">○ Sin conexión</span>}
        </div>
        <button className="btn-secondary" onClick={cargarPedidosDisponibles}>
          🔄 Actualizar
        </button>
      </div>

      {notification && (
        <div className={`alert alert-info ${nuevoPedidoAlert ? 'with-animation' : ''}`}>
          {nuevoPedidoAlert && <NotificationsActiveIcon className="alert-icon" />}
          {notification}
        </div>
      )}

      {pedidosDisponibles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No hay pedidos disponibles</h3>
          <p>No hay pedidos esperando delivery en este momento</p>
        </div>
      ) : (
        <div className="pedidos-grid">
          {pedidosDisponibles.map((pedido) => (
            <div key={pedido.id} className="pedido-card">
              <div className="pedido-header">
                <div className="pedido-empresa">
                  <span className="empresa-badge">{pedido.empresaName}</span>
                </div>
                <div className="pedido-id">ID: {pedido.id.substring(0, 8)}</div>
              </div>

              <div className="pedido-body">
                <div className="pedido-info-row">
                  <span className="info-label">Cliente:</span>
                  <span className="info-value">{pedido.clienteName}</span>
                </div>
                
                {pedido.tipoEntrega === 'delivery' && (
                  <div className="pedido-info-row">
                    <span className="info-label">📍 Dirección:</span>
                    <span className="info-value">{pedido.direccion}</span>
                  </div>
                )}

                <div className="pedido-info-row">
                  <span className="info-label">Total:</span>
                  <span className="info-value total-amount">${pedido.total.toFixed(2)}</span>
                </div>

                <div className="pedido-footer">
                  <span className="fecha">Hace {new Date(pedido.createdAt).toLocaleString('es-AR')}</span>
                </div>
              </div>

              <button 
                className="btn-tomar-pedido"
                onClick={() => handleTomarPedido(pedido.id)}
              >
                Tomar Pedido
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TomaPedidosSection;
