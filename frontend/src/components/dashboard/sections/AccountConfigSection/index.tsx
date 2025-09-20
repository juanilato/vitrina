import React from 'react';
import useAccountConfig from './hooks/useAccountConfig';
import { ProfileTab, LocationsTab, SecurityTab, PreferencesTab } from './components';
import './AccountConfigSection.css';
import TestMap from './components/test';

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
    resetForm
  } = useAccountConfig();

  // Log para debuggear
  console.log('🏢 [ACCOUNT CONFIG] Estado actual:', {
    loading,
    saving,
    empresaData: empresaData ? {
      id: empresaData.id,
      name: empresaData.name,
      ubicacionesCount: empresaData.ubicaciones?.length || 0
    } : null,
    formData: {
      ubicacionesCount: formData.ubicaciones?.length || 0,
      ubicaciones: formData.ubicaciones
    }
  });
  
  // Log simple para verificar
  console.log('UBICACIONES EN CONFIG:', formData.ubicaciones);

  if (loading) {
    return (
      <div className="account-config-loading">
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p className="loading-text">Cargando configuración de cuenta...</p>
        </div>
      </div>
    );
  }

  if (!empresaData) {
    return (
      <div className="account-config-error">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <h3>Error al cargar datos</h3>
          <p>No se pudieron cargar los datos de la empresa.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: '👤' },
    { id: 'locations', label: 'Ubicaciones', icon: '📍' },
    { id: 'security', label: 'Seguridad', icon: '🔒' },
    { id: 'preferences', label: 'Preferencias', icon: '⚙️' }
  ] as const;

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'locations':
        return <LocationsTab />;
      case 'security':
        return <SecurityTab />;
      case 'preferences':
        return <PreferencesTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="account-config-section">

      {/* Header */}
      <div className="account-config-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Configuración de Cuenta</h1>
            <p>Gestiona la información de tu empresa y preferencias</p>
          </div>
          
          {hasChanges && (
            <div className="header-actions">
              <button 
                className="btn btn-secondary"
                onClick={resetForm}
                disabled={saving}
              >
                Descartar cambios
              </button>
              <button 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="status-message error">
            <span className="status-icon">⚠️</span>
            <span className="status-text">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="status-message success">
            <span className="status-icon">✅</span>
            <span className="status-text">{success}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="account-config-tabs">
        <div className="tabs-container">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="account-config-content">
        <div className="tab-content-container">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default AccountConfigSection;
