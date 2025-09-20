import React, { useState, useEffect, useCallback } from 'react';
import useAccountConfig from '../hooks/useAccountConfig';
import { PrecioEnvioData, CreatePrecioEnvioData } from '../types';
import PriceZoneMap from './PriceZoneMap';
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
  const [formData, setFormData] = useState<CreatePrecioEnvioData>(() => ({
    ubicacionId,
    precio: 0,
    distancia: 0,
    nombre: ''
  }));
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  const loadPrecios = useCallback(async () => {
    try {
      console.log('🚚 [PRECIOS ENVIO] Cargando precios para ubicación:', ubicacionId);
      setLoading(true);
      const preciosData = await getPreciosEnvio(ubicacionId);
      console.log('🚚 [PRECIOS ENVIO] Precios cargados:', preciosData);
      setPrecios(preciosData);
    } catch (error) {
      console.error('❌ [PRECIOS ENVIO] Error al cargar precios de envío:', error);
    } finally {
      setLoading(false);
    }
  }, [ubicacionId, getPreciosEnvio]);

  // Cargar precios cuando cambie la ubicación
  useEffect(() => {
    loadPrecios();
  }, [ubicacionId, loadPrecios]);

  // Configurar centro del mapa
  useEffect(() => {
    if (ubicacionCoords) {
      setMapCenter({ lat: Number(ubicacionCoords.lat), lng: Number(ubicacionCoords.lng) });
    } else {
      // Coordenadas por defecto (Buenos Aires)
      setMapCenter({ lat: -34.6037, lng: -58.3816 });
    }
  }, [ubicacionCoords]);

  useEffect(() => {
    console.log('[PriceZoneMap DEBUG][PreciosEnvioTab] props snapshot', {
      isAdding,
      editingId,
      formData,
      mapCenter,
      initialRadius: formData.distancia * 1000,
      initialPrice: formData.precio,
      saving,
    });
  }, [formData, mapCenter, isAdding, editingId, saving]);

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
              {mapCenter ? (
                <PriceZoneMap
                  center={mapCenter}
                  onSave={async (data) => {
                    console.log('[PriceZoneMap DEBUG][PreciosEnvioTab] onSave payload', data);
                    try {
                      if (editingId) {
                        await updatePrecioEnvio(ubicacionId, editingId, data);
                      } else {
                        // Agregar ubicacionId al data para createPrecioEnvio
                        const createData: CreatePrecioEnvioData = {
                          ...data,
                          ubicacionId
                        };
                        await createPrecioEnvio(ubicacionId, createData);
                      }
                      
                      await loadPrecios();
                      setIsAdding(false);
                      setEditingId(null);
                    } catch (error) {
                      console.error('Error al guardar precio de envío:', error);
                    }
                  }}
                  onCancel={handleCancel}
                  initialRadius={formData.distancia * 1000} // Convertir km a metros
                  initialPrice={formData.precio}
                  height="500px"
                  saving={saving}
                />
              ) : (
                <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="loading-spinner"></div>
                  <span style={{ marginLeft: '10px' }}>Cargando ubicación...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreciosEnvioTab;
