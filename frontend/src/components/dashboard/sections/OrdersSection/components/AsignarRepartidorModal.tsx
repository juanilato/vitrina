import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../../config/axios.config';
import { useWebSocket } from '../../../../../hooks/useWebSocket';
import './AsignarRepartidorModal.css';

interface Repartidor {
  id: string;
  name: string;
  email: string;
  fotoUrl?: string;
  estado: 'ACEPTADO' | 'PENDIENTE' | 'RECHAZADO';
}

interface AsignarRepartidorModalProps {
  pedidoId: string;
  empresaId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AsignarRepartidorModal: React.FC<AsignarRepartidorModalProps> = ({
  pedidoId,
  empresaId,
  onClose,
  onSuccess,
}) => {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [asignando, setAsignando] = useState(false);
  const [selectedRepartidor, setSelectedRepartidor] = useState<string | null>(null);

  const { isConnected } = useWebSocket({ autoConnect: true });

  useEffect(() => {
    cargarRepartidores();
  }, [empresaId]);

  const cargarRepartidores = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/empresas/${empresaId}/repartidores`);
      // Filtrar solo repartidores activos
      const activos = data.filter((r: Repartidor) => r.estado === 'ACEPTADO');
      setRepartidores(activos);
      setError('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar repartidores');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignar = async () => {
    if (!selectedRepartidor) {
      alert('Por favor seleccioná un repartidor');
      return;
    }

    try {
      setAsignando(true);
      await axiosInstance.post(`/pedidos/${pedidoId}/asignar-repartidor`, {
        repartidorId: selectedRepartidor,
      });
      alert('Repartidor asignado exitosamente');
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al asignar repartidor');
    } finally {
      setAsignando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content asignar-repartidor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Asignar Repartidor</h2>
            {isConnected && <span className="ws-badge">● En vivo</span>}
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando repartidores...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">❌</span>
              {error}
            </div>
          )}

          {!loading && !error && repartidores.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">👤</span>
              <p>No tenés repartidores activos</p>
              <small>Vinculá repartidores desde Configuración → Repartidores</small>
            </div>
          )}

          {!loading && !error && repartidores.length > 0 && (
            <div className="repartidores-list">
              {repartidores.map((repartidor) => (
                <div
                  key={repartidor.id}
                  className={`repartidor-card ${selectedRepartidor === repartidor.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRepartidor(repartidor.id)}
                >
                  <div className="repartidor-avatar">
                    {repartidor.fotoUrl ? (
                      <img src={repartidor.fotoUrl} alt={repartidor.name} />
                    ) : (
                      <span>{repartidor.name[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="repartidor-info">
                    <h4>{repartidor.name}</h4>
                    <p>{repartidor.email}</p>
                  </div>
                  {selectedRepartidor === repartidor.id && (
                    <span className="selected-icon">✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && !error && repartidores.length > 0 && (
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose} disabled={asignando}>
              Cancelar
            </button>
            <button
              className="btn-primary"
              onClick={handleAsignar}
              disabled={asignando || !selectedRepartidor}
            >
              {asignando ? 'Asignando...' : 'Asignar Repartidor'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AsignarRepartidorModal;
