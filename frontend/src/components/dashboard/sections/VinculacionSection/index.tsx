import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../config/axios.config';
import { useWebSocket } from '../../../../hooks/useWebSocket';
import './VinculacionSection.css';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

interface EmpresaVinculada {
  id: string;
  name: string;
  email: string;
  estado: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
  empresaId?: string;
  repartidorId?: string;
  vinculacionId?: number;
}

const VinculacionSection: React.FC = () => {
  const [empresasVinculadas, setEmpresasVinculadas] = useState<EmpresaVinculada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nuevaSolicitud, setNuevaSolicitud] = useState(false);

  const { on, off, isConnected } = useWebSocket({
    autoConnect: true,
  });

  const cargarVinculaciones = async () => {
    try {
      const response = await axiosInstance.get('/repartidores/mis-empresas');
      setEmpresasVinculadas(response.data);
    } catch (err: any) {
      console.error('Error cargando vinculaciones:', err);
    }
  };

  useEffect(() => {
    cargarVinculaciones();
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    // Escuchar nuevas solicitudes de vinculación
    const handleNuevaSolicitud = (data: any) => {
      console.log('[Vinculación] Nueva solicitud recibida:', data);
      setNuevaSolicitud(true);
      setSuccess(`Nueva solicitud de vinculación de ${data.empresaName}`);
      cargarVinculaciones();

      // Quitar la notificación después de 5 segundos
      setTimeout(() => {
        setNuevaSolicitud(false);
        setSuccess('');
      }, 5000);
    };

    const handleVinculacionActualizada = (data: any) => {
      console.log('[Vinculación] Estado actualizado:', data);
      cargarVinculaciones();
    };

    on('nueva_solicitud_vinculacion', handleNuevaSolicitud);
    on('vinculacion_actualizada', handleVinculacionActualizada);

    return () => {
      off('nueva_solicitud_vinculacion', handleNuevaSolicitud);
      off('vinculacion_actualizada', handleVinculacionActualizada);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]); // Solo depende de isConnected. on/off son estables

  const handleAceptar = async (vinculacionId: number) => {
    if (!window.confirm('¿Aceptás la solicitud de vinculación de esta empresa?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axiosInstance.post(`/repartidores/aceptar-vinculacion/${vinculacionId}`);
      setSuccess('Vinculación aceptada exitosamente');
      cargarVinculaciones();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al aceptar la vinculación');
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async (vinculacionId: number) => {
    if (!window.confirm('¿Rechazás la solicitud de vinculación de esta empresa?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axiosInstance.post(`/repartidores/rechazar-vinculacion/${vinculacionId}`);
      setSuccess('Vinculación rechazada');
      cargarVinculaciones();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al rechazar la vinculación');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'ACEPTADO':
        return <CheckCircleOutlineIcon className="estado-icon aceptado" />;
      case 'PENDIENTE':
        return <PendingOutlinedIcon className="estado-icon pendiente" />;
      case 'RECHAZADO':
        return <CheckCircleOutlineIcon className="estado-icon rechazado" />;
      default:
        return null;
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'ACEPTADO':
        return 'Vinculado';
      case 'PENDIENTE':
        return 'Pendiente';
      case 'RECHAZADO':
        return 'Rechazado';
      default:
        return estado;
    }
  };

  return (
    <div className="vinculacion-section">
      <div className="vinculacion-header">
        <div className="header-content">
          <h2>Vinculación con Empresas</h2>
          {isConnected && <span className="ws-status connected">● En vivo</span>}
          {!isConnected && <span className="ws-status disconnected">○ Sin conexión</span>}
        </div>
        <p className="muted">Las empresas pueden solicitarte vinculación. Aceptá o rechazá según corresponda</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && (
        <div className={`alert alert-success ${nuevaSolicitud ? 'with-animation' : ''}`}>
          {nuevaSolicitud && <NotificationsActiveIcon className="alert-icon" />}
          {success}
        </div>
      )}

      {/* Lista de empresas vinculadas */}
      <div className="empresas-list">
        <h3>Empresas Vinculadas</h3>
        {empresasVinculadas.length === 0 ? (
          <div className="empty-state">
            <BusinessOutlinedIcon className="empty-icon" />
            <p>No tenés empresas vinculadas todavía</p>
          </div>
        ) : (
          <div className="empresas-grid">
            {empresasVinculadas.map((empresa, index) => (
              <div key={empresa.id || index} className={`empresa-card ${empresa.estado.toLowerCase()}`}>
                <div className="empresa-header">
                  {getEstadoIcon(empresa.estado)}
                  <div className="empresa-info">
                    <h4>{empresa.name}</h4>
                    <p className="empresa-email">{empresa.email}</p>
                  </div>
                </div>
                
                {empresa.estado === 'PENDIENTE' && empresa.vinculacionId && (
                  <div className="empresa-actions">
                    <button 
                      className="btn-aceptar"
                      onClick={() => handleAceptar(empresa.vinculacionId!)}
                      disabled={loading}
                    >
                      ✓ Aceptar
                    </button>
                    <button 
                      className="btn-rechazar"
                      onClick={() => handleRechazar(empresa.vinculacionId!)}
                      disabled={loading}
                    >
                      ✗ Rechazar
                    </button>
                  </div>
                )}
                
                <div className="empresa-footer">
                  <span className={`estado-badge ${empresa.estado.toLowerCase()}`}>
                    {getEstadoLabel(empresa.estado)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VinculacionSection;