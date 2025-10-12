import React from 'react';
import useAccountConfig from './hooks/useAccountConfig';
import { ProfileTab, SecurityTab, PreferencesTab, PreciosEnvioTab } from './components';
import './AccountConfigSection.css';

import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ChargeUbicacionModule from './components/ChargeUbicacionModule';
import GoogleMapsSelector from './components/GoogleMapsSelector';
const AccountConfigSection: React.FC = () => {
  const {
    loading,
    saving,
    error,
    success,
    empresaData,
    formData,
    hasChanges,
    activeTab,
    setActiveTab,
    resetForm,
    cargaUbicacionInicial,
  } = useAccountConfig();

  if (loading) {
    return (
      <div className="account-shell">
        <div className="card center-card">
          <div className="loading-spinner large" />
          <p className="muted">Cargando configuración de cuenta…</p>
        </div>
      </div>
    );
  }

  if (!empresaData) {
    return (
      <div className="account-shell">
        <div className="card center-card">
          <InfoOutlinedIcon className="state-icon" />
          <h3>Error al cargar datos</h3>
          <p className="muted">No se pudieron cargar los datos de la empresa.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile',     label: 'Perfil',            icon: <PersonOutlineOutlinedIcon fontSize="small" /> },
    { id: 'locations',   label: 'Precios Envío',     icon: <LocalShippingOutlinedIcon fontSize="small" /> },
    { id: 'security',    label: 'Seguridad',         icon: <LockOutlinedIcon fontSize="small" /> },
    { id: 'preferences', label: 'Preferencias Web',  icon: <TuneOutlinedIcon fontSize="small" /> },
  ] as const;

  const renderActiveTab = () => {
    const ubicacion = formData.ubicaciones?.[0];
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'locations':
        if (!ubicacion) {
          return (


<ChargeUbicacionModule
  empresaId={empresaData.id}
  onSaved={(empresaId, dto) => cargaUbicacionInicial(empresaId, dto)}
  showRadiusPreview={false}  
/>

          );
        }
        return (
          <PreciosEnvioTab
            ubicacionId={ubicacion.id}
            ubicacionDireccion={ubicacion.direccion || 'Sin dirección'}
            ubicacionCoords={
              ubicacion.lat && ubicacion.lng
                ? { lat: ubicacion.lat, lng: ubicacion.lng }
                : undefined
            }
            onClose={() => {}}
          />
        );
      case 'security':
        return <SecurityTab />;
      case 'preferences':
        return <PreferencesTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="account-shell">
      {/* Sidebar (igual patrón que Productos/Orders) */}
      <aside className="acs-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            <span className="sidebar-icon"><SettingsOutlinedIcon /></span>
            Configuración
          </h2>
        </div>

        <nav className="sidebar-content">
          <div className="sidebar-section">
       
            <div className="cnav-list">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  className={`cnav-item ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                  aria-pressed={activeTab === t.id}
                >
                  <span className="cnav-icon">{t.icon}</span>
                  <span className="cnav-label">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className="acs-main card">
        <header className="acs-header">
          <div className="acs-header-main">
   

            {hasChanges && (
              <div className="acs-actions">
                <button className="btn btn-secondary" onClick={resetForm} disabled={saving}>
                  Descartar cambios
                </button>
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="acs-status acs-status--error">
              <InfoOutlinedIcon className="status-icon" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="acs-status acs-status--ok">
              <CheckCircleOutlineOutlinedIcon className="status-icon" />
              <span>{success}</span>
            </div>
          )}
        </header>

        <section className="acs-content">
          <div className="tab-card">{renderActiveTab()}</div>
        </section>
      </main>
    </div>
  );
};

export default AccountConfigSection;
