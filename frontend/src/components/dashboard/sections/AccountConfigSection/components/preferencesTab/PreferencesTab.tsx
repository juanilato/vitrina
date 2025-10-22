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
import LiveSitePreview from './components/liveWebPage';
import AliasesEditor from './components/AliasEditor';
import SocialLinksEditor from './components/SocialLinksEditor';

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
  const result: Record<DayKey, TimeSlot[]> = { LUN: [], MAR: [], MIE: [], JUE: [], VIE: [], SAB: [], DOM: [] };
  if (!horarios) return result;
  for (const h of horarios) {
    const openH = Math.floor(h.abreMin / 60).toString().padStart(2, '0');
    const openM = (h.abreMin % 60).toString().padStart(2, '0');
    const closeH = Math.floor(h.cierraMin / 60).toString().padStart(2, '0');
    const closeM = (h.cierraMin % 60).toString().padStart(2, '0');
    result[h.day].push({ open: `${openH}:${openM}`, close: `${closeH}:${closeM}` });
  }
  return result;
};

type PrefsView = 'logos' | 'appearance' | 'hours' | 'preview';

const PreferencesTab: React.FC = () => {
  const { empresaData, saving, updatePreferences, uploadFoto, updateEmpresaExtras } = useAccountConfig();

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

  const handleSave = async () => {
    if (!empresaData?.id) {
      alert('Falta empresaId');
      return;
    }

    const payload: UpdatePreferenciasPayload = {
      empresaId: empresaData.id,
      colorBotones: preferences.colorBotones || null,
      colorFondo: preferences.colorFondo || null,
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
                onRemove={() => {}}
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
          </section>
        )}

        {/* HORARIOS */}
        {activeView === 'hours' && (
          <section className="section-card" aria-labelledby="prefs-hours">

            <CalendarSchedule
              schedule={preferences.schedule}
              onChange={(next) => setPreferences(p => ({ ...p, schedule: next }))}
            />
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
                  name: empresaData?.name || 'Tu Empresa',
                  logo: empresaData?.logo || undefined,
                  ubicaciones: empresaData?.ubicaciones || [],
                  products: (empresaData as any)?.products || [],
                  instagram: (empresaData as any)?.instagram,
                  facebook: (empresaData as any)?.facebook,
                  website: (empresaData as any)?.website,
                }}
                prefs={preferences}
              />
            </div>
          </section>
        )}
      </section>
    </div>
  );
};

export default PreferencesTab;
