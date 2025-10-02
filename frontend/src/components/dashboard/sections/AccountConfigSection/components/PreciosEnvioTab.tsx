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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreatePrecioEnvioData>(() => ({
    ubicacionId,
    precio: 0,
    distancia: 0,
  }));
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [mapDraft, setMapDraft] = useState<{ distancia: number; precio: number }>({ distancia: 3, precio: 0 });

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
      editingId,
      formData,
      mapCenter,
      initialRadius: formData.distancia * 1000,
      initialPrice: formData.precio,
      saving,
    });
  }, [formData, mapCenter, editingId, saving]);

  const handleAdd = () => {
    setFormData({
      ubicacionId,
      precio: 0,
      distancia: 3,
    });
    setMapDraft({ distancia: 3, precio: 0 });
    setEditingId(null);
  };


  const handleEdit = (precio: PrecioEnvioData) => {
    setFormData({
      ubicacionId,
      precio: precio.precio,
      distancia: precio.distancia,
    });
    setEditingId(precio.id);
    setMapDraft({ distancia: precio.distancia, precio: precio.precio });
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
  const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
  const kmFmt = (v: number) => `${v.toFixed(1)} km`;

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      ubicacionId,
      precio: 0,
      distancia: 0,
    });
    setMapDraft({ distancia: 3, precio: 0 });
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


      <div className="precios-envio-content">
        <div className="precios-layout">
          <div className="precios-list">
            <div className="list-header">
              <h4>Precios Configurados</h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  className="btn btn-primary"
                  onClick={handleAdd}
                  disabled={saving}
                >
                  + Agregar
                </button>
                {editingId && (
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(editingId)}
                    disabled={saving}
                  >
                    − Eliminar
                  </button>
                )}
              </div>
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
                  <div 
                    key={precio.id} 
                    className={`precio-card ${editingId === precio.id ? 'selected' : ''}`}
                    onClick={() => handleEdit(precio)}
                  >
                    <div className="precio-info">
                      <div className="precio-header">
                        <h5>{`Precio ${precio.id}`}</h5>
                        <div className="precio-actions">
                          <button 
                            className="btn btn-secondary small"
                            onClick={(e) => { e.stopPropagation(); handleEdit(precio); }}
                            disabled={saving}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn btn-danger small"
                            onClick={(e) => { e.stopPropagation(); handleDelete(precio.id); }}
                            disabled={saving}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div className="precio-details">
                        <div className="detail-item">
                          <span className="label">Distancia:</span>
            <span className="value">{kmFmt(precio.distancia)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Precio:</span>
                      <span className="value">{currency.format(precio.precio)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="precio-map">
            {mapCenter ? (
              <div style={{ position: 'relative' }}>
                <PriceZoneMap
                  center={mapCenter}
                  onSave={async (data) => {
                    // no-op; usamos el botón flotante para guardar
                  }}
                  onCancel={handleCancel}
                  initialRadius={(formData.distancia || 0) * 1000}
                  initialPrice={formData.precio || 0}
                  height="500px"
                  saving={saving}
                  hideActions
                  onChange={(data) => setMapDraft(data)}
                />

                <div style={{ position: 'absolute', right: 16, bottom: 16 }}>
                  <button
                    className="btn btn-primary"
                    disabled={saving || mapDraft.precio <= 0}
                    onClick={async () => {
                      try {
                        const distanciaRedondeada = Math.round(mapDraft.distancia * 10) / 10; // 1 decimal
                        if (editingId) {
                          await updatePrecioEnvio(ubicacionId, editingId, { distancia: distanciaRedondeada, precio: mapDraft.precio });
                        } else {
                          const createData: CreatePrecioEnvioData = {
                            ubicacionId,
                            distancia: distanciaRedondeada,
                            precio: mapDraft.precio,
                          };
                          await createPrecioEnvio(ubicacionId, createData);
                        }
                        await loadPrecios();
                        setEditingId(null);
                      } catch (error) {
                        console.error('Error al actualizar precios de envío:', error);
                      }
                    }}
                  >
                    {saving ? 'Actualizando...' : 'Actualizar precios envío'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
                <span style={{ marginLeft: '10px' }}>Cargando ubicación...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreciosEnvioTab;
