// PreferencesTab.tsx
import React, { useEffect, useMemo, useState } from 'react';
import useAccountConfig from '../../hooks/useAccountConfig';
import {
  SocialLink,
  PreferencesState,
  DayKey,
  TimeSlot,
  UpdatePreferenciasPayload,
  HorarioAtencionData,
  UpdateEmpresaExtrasPayload
} from '../../types';

import EnvioToggle from './components/EnvioToggle';
import ColorPicker from './components/ColorPicker';
import CalendarSchedule from './components/ScheduleEditor';
import ImageUploader from './components/imageUploader';
import { LiveSitePreview } from './components/liveWebPage';
import AliasesEditor from './components/AliasEditor';
import SocialLinksEditor from './components/SocialLinksEditor';
import CatalogQRGenerator from './components/CatalogQRGenerator';

import './PreferencesTab.css';
// Sección de preferencias web: 
//    -> Selector de logos
//    -> Apariencia (colores boton y fondo web) / Envío a domicilio / Alias de transferencia / Redes sociales
//    -> Generador de Horarios 
//    -> Visualizador formato celular Página Propia
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
  const result: Record<DayKey, TimeSlot[]> = { LUN: [], MAR: [], MIE: [], JUE: [], VIE: [], SAB: [], DOM: [] };
  if (!horarios) return result;

  // Helper para obtener el día anterior
  const getPreviousDay = (day: DayKey): DayKey => {
    const days: DayKey[] = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
    const currentIndex = days.indexOf(day);
    return days[(currentIndex - 1 + 7) % 7];
  };

  // Agrupar por día
  const grouped: Record<DayKey, HorarioAtencionData[]> = { LUN: [], MAR: [], MIE: [], JUE: [], VIE: [], SAB: [], DOM: [] };
  for (const h of horarios) {
    grouped[h.day].push(h);
  }

  // Ordenar por slotIndex dentro de cada día
  for (const day of Object.keys(grouped) as DayKey[]) {
    grouped[day].sort((a, b) => a.slotIndex - b.slotIndex);
  }

  const processedIds = new Set<number>(); // IDs de horarios ya procesados

  // Procesar cada día
  for (const day of Object.keys(grouped) as DayKey[]) {
    const dayHorarios = grouped[day];
    const previousDay = getPreviousDay(day);
    const previousDayHorarios = grouped[previousDay] || [];

    for (const h of dayHorarios) {
      if (processedIds.has(h.id)) continue;

      // CASO 1: Horario que empieza a medianoche (00:00)
      // Puede ser una continuación del día anterior
      if (h.abreMin === 0) {
        // Buscar si hay un horario del día anterior que termine a medianoche (1440)
        // y que sea el primero disponible (slotIndex más bajo no procesado)
        const matchingPrevious = previousDayHorarios.find(
          prev => prev.cierraMin === 1440 && !processedIds.has(prev.id)
        );

        if (matchingPrevious) {
          // RECOMBINAR: Mostrar en el día anterior como horario que cruza medianoche
          const openH = Math.floor(matchingPrevious.abreMin / 60).toString().padStart(2, '0');
          const openM = (matchingPrevious.abreMin % 60).toString().padStart(2, '0');
          const closeH = Math.floor(h.cierraMin / 60).toString().padStart(2, '0');
          const closeM = (h.cierraMin % 60).toString().padStart(2, '0');

          result[previousDay].push({ open: `${openH}:${openM}`, close: `${closeH}:${closeM}` });
          processedIds.add(matchingPrevious.id);
          processedIds.add(h.id);
          continue;
        }

        // Si no hay match, es un horario normal que empieza a medianoche
        const openH = Math.floor(h.abreMin / 60).toString().padStart(2, '0');
        const openM = (h.abreMin % 60).toString().padStart(2, '0');
        const closeH = Math.floor(h.cierraMin / 60).toString().padStart(2, '0');
        const closeM = (h.cierraMin % 60).toString().padStart(2, '0');
        result[h.day].push({ open: `${openH}:${openM}`, close: `${closeH}:${closeM}` });
        processedIds.add(h.id);
        continue;
      }

      // CASO 2: Horario que termina a medianoche (1440)
      // Este ya se procesará cuando encontremos su continuación en el día siguiente
      // Solo lo agregamos si NO hay continuación
      if (h.cierraMin === 1440) {
        const nextDay = Object.keys(grouped)[(Object.keys(grouped).indexOf(day) + 1) % 7] as DayKey;
        const nextDayHorarios = grouped[nextDay] || [];

        const hasContinuation = nextDayHorarios.some(
          next => next.abreMin === 0 && !processedIds.has(next.id)
        );

        if (!hasContinuation) {
          // No hay continuación, mostrar como horario normal
          const openH = Math.floor(h.abreMin / 60).toString().padStart(2, '0');
          const openM = (h.abreMin % 60).toString().padStart(2, '0');
          result[h.day].push({ open: `${openH}:${openM}`, close: '23:59' });
          processedIds.add(h.id);
        }
        // Si hay continuación, se procesará desde el día siguiente
        continue;
      }

      // CASO 3: Horario normal (no cruza medianoche)
      const openH = Math.floor(h.abreMin / 60).toString().padStart(2, '0');
      const openM = (h.abreMin % 60).toString().padStart(2, '0');
      const closeH = Math.floor(h.cierraMin / 60).toString().padStart(2, '0');
      const closeM = (h.cierraMin % 60).toString().padStart(2, '0');
      result[h.day].push({ open: `${openH}:${openM}`, close: `${closeH}:${closeM}` });
      processedIds.add(h.id);
    }
  }

  return result;
};

type PrefsView = 'logos' | 'appearance' | 'hours' | 'preview' | 'catalog';

const PreferencesTab: React.FC = () => {
  const { empresaData, saving, updatePreferences, uploadFoto, updateEmpresaExtras, updateApariencia, updateHorarios } = useAccountConfig();

  const initialPreferences = useMemo<PreferencesState>(() => ({
    dashboardFotoUrl: empresaData?.preferenciasWeb?.dashboardFoto ?? '',
    envioDomicilio: Boolean(empresaData?.preferenciasWeb?.envioDomicilio),
    colorBotones: empresaData?.preferenciasWeb?.colorBotones ?? '#0d6efd',
    colorFondo: empresaData?.preferenciasWeb?.colorFondo ?? '#ffffff',
    schedule: hydrateSchedule(empresaData?.preferenciasWeb?.horarios),
  }), [empresaData]);

  const [preferences, setPreferences] = useState<PreferencesState>(initialPreferences);
  const [alias, setAlias] = useState<string>(empresaData?.alias || '');
  const [redes, setRedes] = useState<SocialLink[]>(empresaData?.redesSociales || []);
  const [activeView, setActiveView] = useState<PrefsView>('logos');

  useEffect(() => {
    setPreferences(initialPreferences);
    setAlias(empresaData?.alias || '');
    setRedes(empresaData?.redesSociales || []);
  }, [initialPreferences, empresaData]);

  // Guardar todo (función original mantenida para compatibilidad)
  const handleSave = async () => {
    if (!empresaData?.id) {
      alert('Falta empresaId');
      return;
    }

    const payload: UpdatePreferenciasPayload = {
      empresaId: String(empresaData.id),
      colorBotones: preferences.colorBotones || undefined,
      colorFondo: preferences.colorFondo || undefined,
      envioDomicilio: preferences.envioDomicilio,
      dashboardFoto: preferences.dashboardFotoUrl || undefined,
      horarios: DAYS.flatMap(({ key }) =>
        (preferences.schedule[key] || []).map((slot, idx) => {
          const [oh, om] = slot.open.split(':').map(Number);
          const [ch, cm] = slot.close.split(':').map(Number);
          const abreMin = Math.min(1439, Math.max(0, (oh || 0) * 60 + (om || 0)));
          const cierraMin = Math.max(0, (ch || 0) * 60 + (cm || 0));

          // Permitir horarios que cruzan medianoche (ej: 20:00 a 02:00)
          // El backend se encargará de dividirlos en dos franjas
          return {
            day: key,
            slotIndex: idx,
            abreMin,
            cierraMin: cierraMin === 0 ? 0 : Math.min(1440, cierraMin),
            cerrado: false,
          };
        })
      ),
    };

    console.log('💾 [FRONTEND] Guardando preferencias:', payload);
    await updatePreferences(payload);
    console.log('✅ [FRONTEND] Preferencias guardadas');

    const extras: UpdateEmpresaExtrasPayload = {
      empresaId: empresaData.id,
      alias,
      redesSociales: redes.map(r => ({
        key: (r.key || 'otros').toString().toLowerCase(),
        label: r.label?.trim() || 'Link',
        value: r.value?.trim() || '',
      })),
    };

    console.log('💾 [FRONTEND] Guardando extras:', extras);

    if (typeof updateEmpresaExtras === 'function') {
      await updateEmpresaExtras(extras);
    } else {
      await fetch(`/api/empresa/${empresaData.id}/extras`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aliases: extras.alias, redesSociales: extras.redesSociales }),
      });
    }

    console.log('✅ [FRONTEND] Extras guardados');
    alert('Preferencias y datos de empresa guardados');
  };

  // Guardar solo apariencia
  const handleSaveApariencia = async () => {
    if (!empresaData?.id) {
      alert('Falta empresaId');
      return;
    }

    try {
      await updateApariencia(
        preferences.colorBotones,
        preferences.colorFondo,
        preferences.envioDomicilio
      );

      // Guardar alias y redes sociales
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
      }

      alert('Apariencia guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar apariencia:', error);
      alert('Error al guardar apariencia');
    }
  };

  // Guardar solo horarios
  const handleSaveHorarios = async () => {
    if (!empresaData?.id) {
      alert('Falta empresaId');
      return;
    }

    try {
      await updateHorarios(preferences.schedule);
      alert('Horarios guardados exitosamente');
    } catch (error) {
      console.error('Error al guardar horarios:', error);
      alert('Error al guardar horarios');
    }
  };

  return (
    <div className="prefs-shell" aria-label="Preferencias del sitio">
      <section className="prefs-main card" aria-labelledby="prefs-heading">
        <header className="prefs-header">
          <div className="prefs-header-main">
            <div>
              <h2 id="prefs-heading" className="prefs-title">Preferencias del sitio</h2>
              <p className="prefs-subtitle muted">Configurá tu presencia web</p>
            </div>
            <div className="preferences-actions">
              <button className="btn btn-primary" onClick={handleSave} disabled={saving} aria-live="polite">
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>

          {/* Segmented control (horizontal) */}
          <nav className="seg-tabs minimal" role="tablist" aria-label="Secciones de preferencias">
            {[
              { id: 'logos', label: 'Logos' },
              { id: 'appearance', label: 'Apariencia' },
              { id: 'hours', label: 'Horarios' },
              { id: 'preview', label: 'Visualizador' },
              { id: 'catalog', label: 'Catálogo QR' },
            ].map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={activeView === (t.id as PrefsView)}
                className={`seg-btn ${activeView === (t.id as PrefsView) ? 'active' : ''}`}
                onClick={() => setActiveView(t.id as PrefsView)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </header>

        {/* ====== Vistas exclusivas ====== */}

        {/* LOGOS */}
        {activeView === 'logos' && (
          <section className="section-card" aria-labelledby="prefs-media">
            <div className="section-head">
              <h3 id="prefs-media" className="section-title">Logos e imágenes</h3>
              <p className="section-desc muted">Logo principal e imagen de portada</p>
            </div>
            <div className="preferences-grid">
              <ImageUploader
                label="Logo de la empresa"
                imageUrl={empresaData?.logo ?? ''}
                cropShape="circle"
                aspect={1}
                onUpload={async (file) => {
                  await uploadFoto(file, false);
                  setPreferences(prev => ({ ...prev }));
                }}
                onRemove={() => { }}
              />
              <ImageUploader
                label="Foto de fondo"
                imageUrl={preferences.dashboardFotoUrl}
                cropShape="rect"
                aspect={16 / 9}
                onUpload={async (file) => {
                  await uploadFoto(file, true);
                  setPreferences(prev => ({ ...prev }));
                }}
              />
            </div>
            <div className="section-foot muted">Sugerencia: logo PNG con fondo transparente.</div>
          </section>
        )}

        {/* APARIENCIA */}
        {activeView === 'appearance' && (
          <section className="section-card" aria-labelledby="prefs-appearance">
            <div className="section-head">
              <h3 id="prefs-appearance" className="section-title">Apariencia y opciones</h3>
              <p className="section-desc muted">Definí envíos y paleta de colores</p>
            </div>
            <div className="preferences-grid">
              <ColorPicker
                label="Color de botones"
                description="Color principal para acciones"
                value={preferences.colorBotones}
                onChange={(val) => setPreferences(p => ({ ...p, colorBotones: val }))}
              />
              <ColorPicker
                label="Color de fondo"
                description="Color base del sitio"
                value={preferences.colorFondo}
                onChange={(val) => setPreferences(p => ({ ...p, colorFondo: val }))}
              />
              <EnvioToggle
                value={preferences.envioDomicilio}
                onChange={(val) => setPreferences(p => ({ ...p, envioDomicilio: val }))}
              />

              <AliasesEditor value={alias} onChange={setAlias} />
              <SocialLinksEditor value={redes} onChange={setRedes} />
            </div>
            <div className="section-foot" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSaveApariencia} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar apariencia'}
              </button>
            </div>
          </section>
        )}

        {/* HORARIOS */}
        {activeView === 'hours' && (
          <section className="section-card" aria-labelledby="prefs-hours">
            <div className="section-head">
              <h3 id="prefs-hours" className="section-title">Horarios de atención</h3>
              <p className="section-desc muted">Configurá los horarios de tu negocio</p>
            </div>
            <CalendarSchedule
              schedule={preferences.schedule}
              onChange={(next) => setPreferences(p => ({ ...p, schedule: next }))}
            />
            <div className="section-foot" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSaveHorarios} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar horarios'}
              </button>
            </div>
          </section>
        )}

        {/* VISUALIZADOR */}
        {activeView === 'preview' && (
          <section className="section-card" aria-labelledby="prefs-preview">
            <div className="section-head">
              <h3 id="prefs-preview" className="section-title">Visualizador web</h3>
              <p className="section-desc muted">Vista aproximada del sitio público</p>
            </div>
            <div className="preview-frame">
              <LiveSitePreview
                empresa={{
                  id: empresaData?.id || '',
                  name: empresaData?.name || '',
                }}

              />
            </div>
          </section>
        )}

        {/* CATÁLOGO QR */}
        {activeView === 'catalog' && (
          <section className="section-card" aria-labelledby="prefs-catalog">
            <CatalogQRGenerator
              companyName={empresaData?.name || ''}
              isDark={false}
            />
          </section>
        )}
      </section>
    </div>
  );
};

export default PreferencesTab;
