import React, { useEffect, useMemo, useState } from 'react';
import useAccountConfig from '../../hooks/useAccountConfig';
import { SocialLink ,PreferencesState, DayKey, TimeSlot, UpdatePreferenciasPayload, HorarioAtencionData } from '../../types';
import DashboardFoto from './components/DashboardFoto';
import EnvioToggle from './components/EnvioToggle';
import ColorPicker from './components/ColorPicker';
import CalendarSchedule from './components/ScheduleEditor';
import './PreferencesTab.css';
import ImageUploader from './components/imageUploader';
import LiveSitePreview from './components/liveWebPage'; 
import AliasesEditor from './components/AliasEditor';
import SocialLinksEditor from './components/SocialLinksEditor';
import { UpdateEmpresaExtrasPayload } from '../../types';

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'LUN', label: 'Lunes' },
  { key: 'MAR', label: 'Martes' },
  { key: 'MIE', label: 'Miércoles' },
  { key: 'JUE', label: 'Jueves' },
  { key: 'VIE', label: 'Viernes' },
  { key: 'SAB', label: 'Sábado' },
  { key: 'DOM', label: 'Domingo' },
];

const hydrateSchedule = (horarios: HorarioAtencionData[] | undefined): Record<DayKey, TimeSlot[]> => {
  const result: Record<DayKey, TimeSlot[]> = {
    LUN: [],
    MAR: [],
    MIE: [],
    JUE: [],
    VIE: [],
    SAB: [],
    DOM: [],
  };

  if (!horarios) return result;

  for (const h of horarios) {
    const openH = Math.floor(h.abreMin / 60).toString().padStart(2, '0');
    const openM = (h.abreMin % 60).toString().padStart(2, '0');
    const closeH = Math.floor(h.cierraMin / 60).toString().padStart(2, '0');
    const closeM = (h.cierraMin % 60).toString().padStart(2, '0');

    result[h.day].push({
      open: `${openH}:${openM}`,
      close: `${closeH}:${closeM}`
    });
  }

  return result;
};

const PreferencesTab: React.FC = () => {
 const { empresaData, saving, updatePreferences, uploadFoto, updateEmpresaExtras } = useAccountConfig();


   console.log("EMPRESA DATa del back", empresaData);
const initialPreferences = useMemo<PreferencesState>(() => ({
  dashboardFotoUrl: empresaData?.preferenciasWeb?.dashboardFoto ?? '',
  envioDomicilio: Boolean(empresaData?.preferenciasWeb?.envioDomicilio),
  colorBotones: empresaData?.preferenciasWeb?.colorBotones ?? '#0d6efd',
  colorFondo: empresaData?.preferenciasWeb?.colorFondo ?? '#ffffff',
  schedule: hydrateSchedule(empresaData?.preferenciasWeb?.horarios),
}), [empresaData]);
  const [preferences, setPreferences] = useState<PreferencesState>(initialPreferences);
   const [alias, setAlias] = useState<string>(empresaData?.alias || "");
  const [redes, setRedes] = useState<SocialLink[]>(empresaData?.redesSociales || []);
  
  useEffect(() => {
    setPreferences(initialPreferences);
    setAlias(empresaData?.alias || "");
    setRedes(empresaData?.redesSociales || []);
  }, [initialPreferences, empresaData]);

 const handleSave = async () => {
    if (!empresaData?.id) {
      alert('Falta empresaId');
      return;
    }

    // ---- Preferencias web (como ya lo tenías) ----
    const payload: UpdatePreferenciasPayload = {
      empresaId: empresaData.id,
      colorBotones: preferences.colorBotones,
      colorFondo: preferences.colorFondo,
      envioDomicilio: preferences.envioDomicilio,
      dashboardFoto: preferences.dashboardFotoUrl || null,
      horarios: DAYS.flatMap(({ key }) =>
        (preferences.schedule[key] || []).map((slot, idx) => {
          const [oh, om] = slot.open.split(':').map(Number);
          const [ch, cm] = slot.close.split(':').map(Number);
          return {
            day: key,
            slotIndex: idx,
            abreMin: (oh || 0) * 60 + (om || 0),
            cierraMin: (ch || 0) * 60 + (cm || 0),
            cerrado: false,
          };
        })
      ),
    };

    await updatePreferences(payload);

    // ---- NUEVO: Extras de empresa (aliases + redes) ----
    const extras: UpdateEmpresaExtrasPayload = {
      empresaId: empresaData.id,
      alias,
      redesSociales: redes.map(r => ({
        key: (r.key || 'otros').toString().toLowerCase(),
        label: r.label?.trim() || 'Link',
        value: r.value?.trim() || '',
      })),
    };

    if (typeof updateEmpresaExtras === 'function') {
      await updateEmpresaExtras(extras);
    } else {
      // fallback si aún no actualizaste el hook:
      await fetch(`/api/empresa/${empresaData.id}/extras`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aliases: extras.alias, redesSociales: extras.redesSociales }),
      });
    }

    alert('Preferencias y datos de empresa guardados');
  };
  return (
    <div>
    <div className="preferences-tab">
      <div className="preferences-content">
        <h3>Configuración</h3>
        
        <div className="preferences-grid">

  <ImageUploader
    label="Logo de la empresa"
    imageUrl={empresaData?.logo ?? ""}
    cropShape="circle"     // 🔵 recorte circular (ideal para logos o avatares)
    aspect={1}             // cuadrado, mantiene simetría perfecta
    onUpload={async (file) => {
      await uploadFoto(file, false);
      setPreferences(prev => ({ ...prev }));
    }}
    onRemove={() => {
      console.log("Logo eliminado");
    }}
  />

  <ImageUploader
    label="Foto de fondo"
    imageUrl={preferences.dashboardFotoUrl}
    cropShape="rect"       // 🟦 recorte rectangular
    aspect={16 / 9}        // proporción widescreen (opcional)
    onUpload={async (file) => {
      await uploadFoto(file, true);
      setPreferences(prev => ({ ...prev }));
    }}
  />


          <EnvioToggle
            value={preferences.envioDomicilio}
            onChange={(val) => setPreferences((p) => ({ ...p, envioDomicilio: val }))}
          />
<ColorPicker
  label="Color de botones"
  description="Selecciona el color de los botones en tu web"
  value={preferences.colorBotones}
  onChange={(val) => setPreferences(p => ({ ...p, colorBotones: val }))}
/>

<ColorPicker
  label="Color de fondo"
  description="Selecciona el color de fondo de tu web"
  value={preferences.colorFondo}
  onChange={(val) => setPreferences(p => ({ ...p, colorFondo: val }))}
/>
        </div>

        <div className="preferences-grid" style={{ marginTop: '1rem' }}>
          <AliasesEditor value={alias} onChange={setAlias} />
          <SocialLinksEditor value={redes} onChange={setRedes} />
        </div>

<CalendarSchedule
  schedule={preferences.schedule}
  onChange={(next) => setPreferences(p => ({ ...p, schedule: next }))}
/>

        <div className="preferences-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar preferencias'}
          </button>
        </div>
      </div>

    </div>
          <div className="preferences-preview-wrapper">
  <h4>Previsualización del sitio</h4>
  <LiveSitePreview
    empresa={{
      id: empresaData?.id || "",
      name: empresaData?.name || "Tu Empresa",

      logo: empresaData?.logo || undefined,
      ubicaciones: empresaData?.ubicaciones || [],
      // si tenés productos en este objeto, pasalos:
      products: (empresaData as any)?.products || [],
      instagram: (empresaData as any)?.instagram,
      facebook: (empresaData as any)?.facebook,
      website: (empresaData as any)?.website,
    }}
    prefs={preferences}
  />
</div>
</div>
  );
};

export default PreferencesTab;
