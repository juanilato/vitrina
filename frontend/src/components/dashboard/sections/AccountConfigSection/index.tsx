import React from 'react';
import useAccountConfig from './hooks/useAccountConfig';
import { PreferencesTab, PreciosEnvioTab, CategoriesTab } from './components';
import UnifiedProfileTab from './components/UnifiedProfileTab';
import './AccountConfigSection.css';

import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ChargeUbicacionModule from './components/ChargeUbicacionModule';

import MopedIcon from '@mui/icons-material/Moped';
import RepartidoresTab from './components/RepartidoresTab';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import SubscriptionTab from './components/SubscriptionTab';
// Sección de manejo de settings de la cuenta:
// Perfil unificado: Datos básicos, cambio de contraseña y completación de perfil
// Categorías Selección de categorías y subcategorías de la empresa
// Precios de envío: Manejo de los precios de envío
// Repartidores: Manejo de los repartidores
// Preferencias Web: Apariencia y configuración de la web
// Suscripción (manejo de suscripción): Futuramente 
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
    { id: 'categories',  label: 'Categorías',        icon: <CategoryOutlinedIcon fontSize="small" /> },
    { id: 'locations',   label: 'Precios Envío',     icon: <LocalShippingOutlinedIcon fontSize="small" /> },
    { id: 'delivery',    label: 'Repartidores',      icon: <MopedIcon fontSize="small" /> },
    { id: 'preferences', label: 'Preferencias Web',  icon: <TuneOutlinedIcon fontSize="small" /> },
    { id: 'subscription', label: 'Suscripción',      icon: <CreditCardOutlinedIcon fontSize="small" /> },
  ] as const;

  const renderActiveTab = () => {
    const ubicacion = formData.ubicaciones?.[0];
    switch (activeTab) {
      case 'profile':
        return <UnifiedProfileTab />;
      case 'categories':
        return <CategoriesTab />;
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
      case 'preferences':
        return <PreferencesTab />;
      case 'delivery':
        return <RepartidoresTab />;
      case 'subscription':
        return <SubscriptionTab />;
      default:
        return <UnifiedProfileTab />;
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
