import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../../config/axios.config';
import { useRepartidorSocket } from '../../../../contexts/RepartidorSocketContext';
import './RepartidorOrdersSection.css';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { RepartidorOrdersSectionSkeleton } from '../../../skeletons';

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
  const [trackingPedidoId, setTrackingPedidoId] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { on, off, isConnected, emit } = useRepartidorSocket();

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

  // Función para iniciar el tracking GPS
  const iniciarTracking = (pedidoId: string) => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización');
      return;
    }

    setTrackingPedidoId(pedidoId);
    setLocationError(null);

    // Enviar ubicación inmediatamente
    enviarUbicacion(pedidoId);

    // Configurar envío periódico cada 10 segundos
    locationIntervalRef.current = setInterval(() => {
      enviarUbicacion(pedidoId);
    }, 10000);
  };

  // Función para detener el tracking GPS
  const detenerTracking = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    setTrackingPedidoId(null);
    setLocationError(null);
  };

  // Función para enviar la ubicación actual
  const enviarUbicacion = (pedidoId: string) => {
    console.log(`📍 [GPS] ========== SOLICITANDO UBICACIÓN GPS ==========`);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;

        console.log(`📍 [GPS] ========== UBICACIÓN GPS OBTENIDA ==========`);
        console.log(`📍 [GPS] Coordenadas:`);
        console.log(`📍 [GPS] - Latitud: ${latitude}`);
        console.log(`📍 [GPS] - Longitud: ${longitude}`);
        console.log(`📍 [GPS] - Precisión: ${accuracy} metros`);
        console.log(`📍 [GPS] - Altitud: ${altitude} metros`);
        console.log(`📍 [GPS] - Precisión Altitud: ${altitudeAccuracy} metros`);
        console.log(`📍 [GPS] - Rumbo: ${heading}°`);
        console.log(`📍 [GPS] - Velocidad: ${speed} m/s`);
        console.log(`📍 [GPS] - Timestamp: ${new Date(position.timestamp).toISOString()}`);

        // ⚠️ ADVERTENCIA: Si la precisión es mayor a 50 metros, probablemente está usando IP/WiFi
        if (accuracy > 50) {
          console.warn(`⚠️ [GPS] BAJA PRECISIÓN DETECTADA: ${accuracy} metros`);
          console.warn(`⚠️ [GPS] Esto sugiere que el navegador está usando WiFi/IP en lugar de GPS real`);
          console.warn(`⚠️ [GPS] Recomendación: Usar un dispositivo móvil con GPS o habilitar permisos de ubicación`);
          setLocationError(`⚠️ GPS de baja precisión (${Math.round(accuracy)}m). Puede no ser exacto.`);
        } else {
          console.log(`✅ [GPS] Buena precisión: ${accuracy} metros`);
          setLocationError(null);
        }

        // Validar que las coordenadas sean válidas
        if (latitude === 0 && longitude === 0) {
          console.error('❌ [GPS] Coordenadas inválidas (0, 0)');
          setLocationError('GPS devolvió coordenadas inválidas');
          return;
        }

        try {
          // Enviar al backend vía HTTP (ahora con el ID del pedido en la ruta)
          await axiosInstance.patch(`/repartidores/pedidos/${pedidoId}/ubicacion`, {
            lat: latitude,
            lng: longitude,
          });

          console.log(`✅ [GPS] Ubicación enviada al backend via HTTP`);

          // Emitir vía WebSocket para actualización en tiempo real
          emit('actualizar_ubicacion_repartidor', {
            pedidoId,
            latitud: latitude,
            longitud: longitude,
          });

          console.log(`✅ [GPS] Ubicación enviada via WebSocket`);
          console.log(`📍 [GPS] ================================================`);
        } catch (err: any) {
          console.error('❌ [GPS] Error al enviar ubicación:', err);
          setLocationError('Error al enviar ubicación');
        }
      },
      (error) => {
        console.error('❌ [GPS] ========== ERROR GPS ==========');
        console.error('❌ [GPS] Código de error:', error.code);
        console.error('❌ [GPS] Mensaje:', error.message);

        let errorMessage = 'Error al obtener ubicación GPS';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '🚫 Permisos de ubicación denegados. Por favor, habilita el GPS en tu navegador.';
            console.error('❌ [GPS] El usuario negó los permisos de ubicación');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '📍 Ubicación no disponible. Verifica que el GPS esté habilitado.';
            console.error('❌ [GPS] La ubicación no está disponible');
            break;
          case error.TIMEOUT:
            errorMessage = '⏱️ Tiempo de espera agotado. Intentando nuevamente...';
            console.error('❌ [GPS] Tiempo de espera agotado');
            break;
        }

        setLocationError(errorMessage);
        console.error('❌ [GPS] =====================================');
      },
      {
        enableHighAccuracy: true, // Forzar uso de GPS en lugar de WiFi/IP
        timeout: 10000, // Aumentar timeout a 10 segundos
        maximumAge: 0, // No usar ubicaciones en caché
      }
    );
  };

  const handleActualizarEstado = async (pedidoId: string, nuevoEstado: string) => {
    try {
      // Si está marcando como "en_camino", usar el endpoint específico
      if (nuevoEstado === 'en_camino') {
        await axiosInstance.patch(`/pedidos/${pedidoId}/en-camino`);
        window.alert('Pedido marcado como en camino. Iniciando tracking GPS...');
        iniciarTracking(pedidoId);
      }
      // Si está marcando como "entregado", usar el endpoint específico
      else if (nuevoEstado === 'entregado') {
        await axiosInstance.patch(`/pedidos/${pedidoId}/entregado`);
        window.alert('Pedido marcado como entregado');
        detenerTracking();
      }
      // Para otros estados, usar el endpoint genérico
      else {
        await axiosInstance.patch(`/repartidores/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
        window.alert('Estado actualizado correctamente');
      }

      cargarMisPedidos();
    } catch (err: any) {
      window.alert(err?.response?.data?.message || 'Error al actualizar el estado');
    }
  };

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      detenerTracking();
    };
  }, []);

  if (loading) {
    return <RepartidorOrdersSectionSkeleton />;
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

      {trackingPedidoId && (
        <div className="alert alert-success with-animation">
          <LocationOnIcon className="alert-icon" />
          GPS Activo - Enviando ubicación cada 10 segundos
        </div>
      )}

      {locationError && (
        <div className="alert alert-error with-animation">
          <span className="alert-icon">⚠️</span>
          {locationError}
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
