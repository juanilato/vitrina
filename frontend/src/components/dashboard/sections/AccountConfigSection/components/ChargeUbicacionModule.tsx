// ChargeUbicacionModule.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GoogleMapsSelector from '../components/GoogleMapsSelector';

import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import MyLocationOutlinedIcon from '@mui/icons-material/MyLocationOutlined';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import './ChargeUbicacionModule.css';
import { Ubicacion } from '../types';

// Trae ubicación de empresa para el maps
interface Props {
  empresaId: string;
  onSaved: (empresaId: string, dto: Ubicacion) => void | Promise<void>;
  /** Dejar en false salvo que NO uses otro loader en toda la vista */
  showRadiusPreview?: boolean;
}
const ChargeUbicacionModule: React.FC<Props> = ({
  empresaId,
  onSaved,
  // ⬇️ por defecto apagado para evitar conflicto con el loader del selector
  showRadiusPreview = false,
}) => {
  const [selected, setSelected] = useState<{ direccion: string; lat: number; lng: number } | null>(null);
  const [manualDireccion, setManualDireccion] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const canSave = useMemo(() => {
    if (!selected) return false;
    if (!selected.direccion?.trim() && !manualDireccion.trim()) return false;
    if (Number.isNaN(selected.lat) || Number.isNaN(selected.lng)) return false;
    return true;
  }, [selected, manualDireccion]);

  const handleSelect = useCallback((loc: { direccion: string; lat: number; lng: number }) => {
    setSelected(loc);
    setManualDireccion(loc.direccion ?? '');
    setErrorMsg(null);
    setSuccess(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!canSave || !selected) return;

    setSaving(true);
    setErrorMsg(null);
    setSuccess(false);

    const dto: Ubicacion = {
      direccion: (manualDireccion?.trim() || selected.direccion || '').trim(),
      lat: Number(selected.lat),
      lng: Number(selected.lng),
    };

    try {
      await onSaved(empresaId, dto);
      setSuccess(true);
    } catch (e: any) {
      const message =
        e?.response?.data?.message || e?.message || 'No se pudo crear la ubicación.';
      setErrorMsg(Array.isArray(message) ? message.join(' - ') : message);
    } finally {
      setSaving(false);
    }
  }, [canSave, selected, manualDireccion, onSaved, empresaId]);

  // Forzar resize cuando el componente se monta (por si el tab estaba oculto)
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('resize'));
    }, 80);
    return () => clearTimeout(t);
  }, []);

  // Forzar resize al cambiar la selección (recarga/acentra tiles)
  useEffect(() => {
    if (!selected) return;
    const t = setTimeout(() => {
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('resize'));
    }, 50);
    return () => clearTimeout(t);
  }, [selected]);

  // Forzar resize cuando cambia el tamaño del contenedor
  useEffect(() => {
    if (!wrapperRef.current) return;
    const ro = new ResizeObserver(() => {
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('resize'));
    });
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="wrapper" ref={wrapperRef}>
      <header className="header">
        <div>
          <h3 className="title">Configurar ubicación de la empresa</h3>
          <p className="subtitle">
            Elegí la dirección en el mapa, ajustá el pin y guardá. Esto habilita la configuración de precios de envío.
          </p>
        </div>
        {success && (
          <div className="successPill">
            <CheckCircleOutlineOutlinedIcon fontSize="small" />
            <span>Ubicación creada</span>
          </div>
        )}
      </header>

      <section className="card">
        {/* El selector usa TU loader (useGoogleMaps). Debe ser el ÚNICO loader activo aquí. */}
        <GoogleMapsSelector
          onLocationSelect={handleSelect}
          initialLocation={null}
          height="380px"
          // si tu selector soporta esta prop, podrías pasar libraries={['places']}
        />

        <div className="fields">
          <label className="label">Dirección (podés ajustar el texto)</label>
          <div className="inputRow">
            <RoomOutlinedIcon className="inputIcon" />
            <input
              type="text"
              className="input"
              placeholder="Calle, número, ciudad, provincia, país"
              value={manualDireccion}
              onChange={(e) => {
                setManualDireccion(e.target.value);
                setSuccess(false);
              }}
            />
          </div>

          {selected && (
            <div className="coordsRow">
              <span className="coordsItem">
                <MyLocationOutlinedIcon fontSize="small" />
                <b>Lat:</b>&nbsp;{selected.lat.toFixed(6)}
              </span>
              <span className="coordsItem">
                <b>Lng:</b>&nbsp;{selected.lng.toFixed(6)}
              </span>
            </div>
          )}
        </div>

        {/* Preview desactivada para evitar doble loader.
            Si querés usarla, adaptá InteractiveMap para NO cargar scripts y leer window.google */}
        {false && showRadiusPreview && selected && ( // <- queda false para evitar conflictos
          <div className="previewBlock">
            <p className="previewTitle">
              Vista previa de zona (el radio se edita luego en Precios de Envío)
            </p>
            {/* <InteractiveMap
              center={{ lat: selected.lat, lng: selected.lng }}
              onCircleChange={() => {}}
              initialRadius={3000}
              height="280px"
            /> */}
          </div>
        )}
      </section>

      {errorMsg && <div className="error">{errorMsg}</div>}

      <footer className="footer">
        <button
          type="button"
          className="cancelBtn"
          onClick={() => {
            setSelected(null);
            setManualDireccion('');
            setErrorMsg(null);
            setSuccess(false);
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('resize'));
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="saveBtn"
          onClick={handleSave}
          disabled={!canSave || saving}
          aria-disabled={!canSave || saving}
        >
          {saving ? 'Guardando…' : 'Guardar ubicación'}
        </button>
      </footer>
    </div>
  );
};

export default ChargeUbicacionModule;
