import React, { useEffect, useMemo, useState } from 'react';
import useAccountConfig from '../../hooks/useAccountConfig';
import { PreferencesState, DayKey, TimeSlot, UpdatePreferenciasPayload, HorarioAtencionData } from '../../types';
import DashboardFoto from './components/DashboardFoto';
import EnvioToggle from './components/EnvioToggle';
import ColorPicker from './components/ColorPicker';
import CalendarSchedule from './components/ScheduleEditor';
import './PreferencesTab.css';


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
   const { empresaData, saving, updatePreferences } = useAccountConfig();

   console.log("EMPRESA DATa del back", empresaData);
const initialPreferences = useMemo<PreferencesState>(() => ({
  dashboardFotoUrl: empresaData?.preferenciasWeb?.dashboardFoto ?? '',
  envioDomicilio: Boolean(empresaData?.preferenciasWeb?.envioDomicilio),
  colorBotones: empresaData?.preferenciasWeb?.colorBotones ?? '#0d6efd',
  colorFondo: empresaData?.preferenciasWeb?.colorFondo ?? '#ffffff',
  schedule: hydrateSchedule(empresaData?.preferenciasWeb?.horarios),
}), [empresaData]);
  const [preferences, setPreferences] = useState<PreferencesState>(initialPreferences);

  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);

  // acciones para ScheduleEditor
  const addSlot = (day: DayKey) => {
    setPreferences(prev => {
      const daySlots = prev.schedule[day] ?? [];
      return {
        ...prev,
        schedule: { ...prev.schedule, [day]: [...daySlots, { open: '09:00', close: '13:00' }] }
      };
    });
  };

  const removeSlot = (day: DayKey, idx: number) => {
    setPreferences(prev => {
      const daySlots = [...(prev.schedule[day] ?? [])];
      daySlots.splice(idx, 1);
      return {
        ...prev,
        schedule: { ...prev.schedule, [day]: daySlots }
      };
    });
  };

  const updateSlot = (day: DayKey, idx: number, field: keyof TimeSlot, val: string) => {
    setPreferences(prev => {
      const daySlots = [...(prev.schedule[day] ?? [])];
      const slot = { ...daySlots[idx], [field]: val } as TimeSlot;
      daySlots[idx] = slot;
      return {
        ...prev,
        schedule: { ...prev.schedule, [day]: daySlots }
      };
    });
  };

  const handleSave = async () => {
    if (!empresaData?.id) {
      alert('Falta empresaId');
      return;
    }

    // construir horarios para el back
const payload: UpdatePreferenciasPayload = {
  empresaId: empresaData.id,
  colorBotones: preferences.colorBotones,
  colorFondo: preferences.colorFondo,
  envioDomicilio: preferences.envioDomicilio,
  dashboardFoto: preferences.dashboardFotoUrl || null, // mapeo a campo del back
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
  };

  return (
    <div className="preferences-tab">
      <div className="preferences-content">
        <h3>Preferencias Web</h3>
        <div className="preferences-grid">
          <DashboardFoto
            fotoUrl={preferences.dashboardFotoUrl}
            onFileSelect={(file, preview) =>
              setPreferences((prev) => ({ ...prev, dashboardFotoUrl: preview ?? '' }))
            }
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
  );
};

export default PreferencesTab;
