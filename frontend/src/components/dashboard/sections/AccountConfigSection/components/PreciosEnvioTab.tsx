import React, { useState, useEffect, useCallback } from 'react';
import useAccountConfig from '../hooks/useAccountConfig';
import { PrecioEnvioData, CreatePrecioEnvioData } from '../types';
import InteractiveMap from './InteractiveMap';
import './PreciosEnvioTab.css';

interface PreciosEnvioTabProps {
  ubicacionId: number;
  ubicacionDireccion: string;
  ubicacionCoords?: { lat: number; lng: number };
  onClose: () => void;
}

const PreciosEnvioTab: React.FC<PreciosEnvioTabProps> = ({ 
  ubicacionId, 
  ubicacionDireccion, 
  ubicacionCoords,
  onClose 
}) => {
  const {
    getPreciosEnvio,
    createPrecioEnvio,
    updatePrecioEnvio,
    removePrecioEnvio,
    saving
  } = useAccountConfig();

  const [precios, setPrecios] = useState<PrecioEnvioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreatePrecioEnvioData>({
    ubicacionId,
    precio: 0,
    distancia: 0,
    nombre: ''
  });
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadPrecios = useCallback(async () => {
    if (hasLoaded) {
      console.log('🚚 [PRECIOS ENVIO] Ya se cargaron los datos, evitando llamada duplicada');
      return;
    }

    try {
      console.log('🚚 [PRECIOS ENVIO] Cargando precios para ubicación:', ubicacionId);
      console.log('🚚 [PRECIOS ENVIO] Estado loading antes:', loading);
      setLoading(true);
      setHasLoaded(true);
      console.log('🚚 [PRECIOS ENVIO] Estado loading después de setLoading(true):', true);
      const preciosData = await getPreciosEnvio(ubicacionId);
      console.log('🚚 [PRECIOS ENVIO] Precios cargados:', preciosData);
      setPrecios(preciosData);
    } catch (error) {
      console.error('❌ [PRECIOS ENVIO] Error al cargar precios de envío:', error);
      setHasLoaded(false); // Reset para permitir reintento
    } finally {
      console.log('🚚 [PRECIOS ENVIO] Finalizando carga, setLoading(false)');
      setLoading(false);
    }
  }, [ubicacionId, getPreciosEnvio, hasLoaded]);

  // Reset hasLoaded cuando cambie la ubicación
  useEffect(() => {
    setHasLoaded(false);
  }, [ubicacionId]);

  // Cargar precios al montar el componente
  useEffect(() => {
    loadPrecios();
  }, [loadPrecios]);

  // Configurar centro del mapa
  useEffect(() => {
    if (ubicacionCoords) {
      setMapCenter(ubicacionCoords);
    } else {
      // Coordenadas por defecto (Buenos Aires)
      setMapCenter({ lat: -34.6037, lng: -58.3816 });
    }
  }, [ubicacionCoords]);

  const handleAdd = () => {
    setFormData({
      ubicacionId,
      precio: 0,
      distancia: 3, // 3km por defecto
      nombre: ''
    });
    setIsAdding(true);
    setEditingId(null);
  };

  const handleCircleChange = (radius: number, center: { lat: number; lng: number }) => {
    const distanceInKm = Math.round((radius / 1000) * 10) / 10;
    setFormData(prev => ({
      ...prev,
      distancia: distanceInKm
    }));
  };

  const handleEdit = (precio: PrecioEnvioData) => {
    setFormData({
      ubicacionId,
      precio: precio.precio,
      distancia: precio.distancia,
      nombre: precio.nombre || ''
    });
    setEditingId(precio.id);
    setIsAdding(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updatePrecioEnvio(ubicacionId, editingId, formData);
      } else {
        await createPrecioEnvio(ubicacionId, formData);
      }
      
      await loadPrecios();
      setIsAdding(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error al guardar precio de envío:', error);
    }
  };

  const handleDelete = async (precioId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este precio de envío?')) {
      try {
        await removePrecioEnvio(ubicacionId, precioId);
        await loadPrecios();
      } catch (error) {
        console.error('Error al eliminar precio de envío:', error);
      }
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      ubicacionId,
      precio: 0,
      distancia: 0,
      nombre: ''
    });
  };

  console.log('🚚 [PRECIOS ENVIO] Render - loading:', loading, 'precios:', precios.length);

  if (loading) {
    return (
      <div className="precios-envio-loading">
        <div className="loading-spinner"></div>
        <p>Cargando precios de envío...</p>
      </div>
    );
  }

  return (
    <div className="precios-envio-tab">
      <div className="precios-envio-header">
        <div className="header-content">
          <h3>Precios de Envío</h3>
          <p>Gestiona los precios de envío para: <strong>{ubicacionDireccion}</strong></p>
        </div>
        <button className="btn btn-secondary" onClick={onClose}>
          ✕ Cerrar
        </button>
      </div>

      <div className="precios-envio-content">
        {/* Lista de precios existentes */}
        <div className="precios-list">
          <div className="list-header">
            <h4>Precios Configurados</h4>
            <button 
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={saving}
            >
              + Agregar Precio
            </button>
          </div>

          {precios.length === 0 ? (
            <div className="empty-precios">
              <span className="empty-icon">🚚</span>
              <p>No hay precios de envío configurados</p>
              <p className="empty-description">
                Agrega precios basados en distancia para esta ubicación
              </p>
            </div>
          ) : (
            <div className="precios-grid">
              {precios.map((precio) => (
                <div key={precio.id} className="precio-card">
                  <div className="precio-info">
                    <div className="precio-header">
                      <h5>{precio.nombre || `Precio ${precio.id}`}</h5>
                      <div className="precio-actions">
                        <button 
                          className="btn btn-secondary small"
                          onClick={() => handleEdit(precio)}
                          disabled={saving}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn btn-danger small"
                          onClick={() => handleDelete(precio.id)}
                          disabled={saving}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <div className="precio-details">
                      <div className="detail-item">
                        <span className="label">Distancia:</span>
                        <span className="value">{precio.distancia} km</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Precio:</span>
                        <span className="value">${precio.precio}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulario de agregar/editar */}
        {isAdding && (
          <div className="precio-form">
            <div className="form-header">
              <h4>{editingId ? 'Editar Precio' : 'Agregar Precio'}</h4>
              <p>Configura la zona de envío usando el mapa interactivo</p>
            </div>
            
            <div className="form-content">
              {/* Mapa interactivo */}
              {mapCenter && (
                <div className="map-section">
                  <h5>Zona de Envío</h5>
                  <InteractiveMap
                    center={mapCenter}
                    onCircleChange={handleCircleChange}
                    initialRadius={formData.distancia * 1000} // Convertir km a metros
                    height="300px"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Nombre de la zona (opcional)</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  className="form-input"
                  placeholder="Ej: Zona Centro, Zona Norte"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Distancia (km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.distancia}
                    onChange={(e) => setFormData(prev => ({ ...prev, distancia: parseFloat(e.target.value) || 0 }))}
                    className="form-input"
                    placeholder="Ej: 5.5"
                    readOnly={true} // Solo se controla desde el mapa
                  />
                  <small className="form-help">
                    Ajusta la distancia usando el slider del mapa
                  </small>
                </div>

                <div className="form-group">
                  <label>Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio}
                    onChange={(e) => setFormData(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
                    className="form-input"
                    placeholder="Ej: 150.00"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving || formData.distancia <= 0 || formData.precio <= 0}
                >
                  {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Agregar')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreciosEnvioTab;
