import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useAccountConfig from '../hooks/useAccountConfig';
import { PrecioEnvioData, CreatePrecioEnvioData } from '../types';
import PriceZoneMap from './PriceZoneMap';
import './PreciosEnvioTab.css';
import DeleteIcon from '@mui/icons-material/Delete';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import { SkeletonForm } from '../../../../skeletons';
interface PreciosEnvioTabProps {
  ubicacionId: number;
  ubicacionDireccion: string;
  ubicacionCoords?: { lat: number; lng: number };
  onClose: () => void;
}
// Tabulador de precios de envío selecciona, guarda y agrega precios de ser necesario 
const PreciosEnvioTab: React.FC<PreciosEnvioTabProps> = ({
  ubicacionId,
  ubicacionDireccion,
  ubicacionCoords,
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
      setLoading(true);
      const preciosData = await getPreciosEnvio(ubicacionId);
      setPrecios(preciosData);
    } catch (error) {
      console.error('❌ Error al cargar precios de envío:', error);
    } finally {
      setLoading(false);
    }
  }, [ubicacionId, getPreciosEnvio]);

  useEffect(() => { loadPrecios(); }, [ubicacionId, loadPrecios]);

  useEffect(() => {
    if (ubicacionCoords) {
      setMapCenter({ lat: Number(ubicacionCoords.lat), lng: Number(ubicacionCoords.lng) });
    } else {
      setMapCenter({ lat: -34.6037, lng: -58.3816 });
    }
  }, [ubicacionCoords]);

  const handleAdd = () => {
    setFormData({ ubicacionId, precio: 0, distancia: 3 });
    setMapDraft({ distancia: 3, precio: 0 });
    setEditingId(null);
  };

  const handleEdit = (precio: PrecioEnvioData) => {
    setFormData({ ubicacionId, precio: precio.precio, distancia: precio.distancia });
    setEditingId(precio.id);
    setMapDraft({ distancia: precio.distancia, precio: precio.precio });
  };

  const toTiers = (precios: PrecioEnvioData[]) =>
  precios
    .map(p => ({ maxKm: Number(p.distancia) || 0, price: Number(p.precio) || 0, id: p.id }))
    .filter(t => t.maxKm > 0)
    .sort((a, b) => a.maxKm - b.maxKm);
 
   const tiers = useMemo(() => toTiers(precios), [precios]);

  const handleDelete = async (precioId: number) => {
    if (!window.confirm('¿Eliminar este precio de envío?')) return;
    try {
      await removePrecioEnvio(ubicacionId, precioId);
      await loadPrecios();
      if (editingId === precioId) {
        setEditingId(null);
        setMapDraft({ distancia: 3, precio: 0 });
      }
    } catch (error) {
      console.error('Error al eliminar precio de envío:', error);
    }
  };

  const currency = new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0
  });
  const kmFmt = (v: number) => `${v.toFixed(1)} km`;

  const maxConfiguredRadiusMeters = useMemo(() => {
    if (!precios.length) return 0;
    const maxKm = Math.max(...precios.map(p => Number(p.distancia) || 0));
    return Math.max(0, maxKm) * 1000;
  }, [precios]);

  if (loading) {
    return (
      <div className="pe-shell">
        <SkeletonForm fields={4} hasImageUpload={false} />
      </div>
    );
  }

  return (
    <div className="pe-shell">

{/* Header */}
<header className="pe-header card">


    <div>
      <p className="muted">{ubicacionDireccion || 'Ubicación sin dirección'}</p>

  </div>
</header>

      <div className="pe-grid">
        {/* Tabla plana */}
        <aside className="pe-list card">
          <div className="pe-table-wrap">
            <table className="pe-table">
              <thead>
                <tr>
                  <th>Distancia</th>
                  <th>Precio</th>
                  <th className="th-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {precios.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <div className="empty-precios">
                        <span className="empty-icon">🚚</span>
                        <p className="empty-title">Sin precios de envío</p>
                        <p className="empty-description">Agregá un precio basado en distancia para esta ubicación.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  precios
                    .sort((a, b) => (a.distancia - b.distancia)) // orden ascendente por distancia
                    .map((p) => (
                      <tr
                        key={p.id}
                        className={editingId === p.id ? 'is-active' : ''}
                        onClick={() => handleEdit(p)}
                      >
                        <td>
                          <span className="chip km">{kmFmt(p.distancia)}</span>
                        </td>
                        <td>
                          <strong className="chip price">{currency.format(p.precio)}</strong>
                        </td>
                        <td className="col-actions">
                          <button
                            className="icon-btn subtle"
                            title="Eliminar"
                            onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                            disabled={saving}
                            aria-label="Eliminar"
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </aside>

        {/* Mapa */}
        <section className="pe-map card">
          {mapCenter ? (
            <div className="map-wrap">
            <PriceZoneMap
  center={mapCenter}
  onSave={() => {}}
      onCancel={() => {
                setEditingId(null);
                setMapDraft({ distancia: 3, precio: 0 });
              }}
  initialRadius={(formData.distancia || 0) * 1000}
  initialPrice={formData.precio || 0}
  height="500px"
  saving={saving}
  hideActions
  onChange={(data) => setMapDraft(data)}
  zones={precios.map(p => ({ distancia: p.distancia, precio: p.precio }))}  // 👈 AQUÍ
/>

   <div className="pzmfloating-save">
  <button
    className="btn-fab btn-fab--primary"
    aria-label={saving ? 'Actualizando precios de envío' : 'Guardar precio y radio'}
    disabled={saving || mapDraft.precio <= 0}
    onClick={async () => {
      try {
        const distanciaRedondeada = Math.round(mapDraft.distancia * 10) / 10;
        if (editingId) {
          await updatePrecioEnvio(ubicacionId, editingId, {
            distancia: distanciaRedondeada,
            precio: mapDraft.precio
          });
        } else {
          const payload: CreatePrecioEnvioData = {
            ubicacionId,
            distancia: distanciaRedondeada,
            precio: mapDraft.precio
          };
          await createPrecioEnvio(ubicacionId, payload);
        }
        await loadPrecios();
        setEditingId(null);
      } catch (error) {
        console.error('Error al actualizar precios de envío:', error);
      }
    }}
  >
    {saving ? '…' :  <AddLocationAltIcon fontSize="small" />} 
  </button>
</div>
            </div>
          ) : (
            <div className="map-skeleton" style={{ position: 'relative', height: '400px' }}>
              <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '12px' }} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PreciosEnvioTab;
