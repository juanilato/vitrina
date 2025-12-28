import React from 'react';
import useAccountConfig from './hooks/useAccountConfig';
import {
  AccountConfigHeader,
  AccountConfigSidebar,
  AccountConfigContent,
} from './components';
import type { TabId } from './components/AccountConfigSidebar';
import './AccountConfigSection.css';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { AccountConfigSectionSkeleton } from '../../../skeletons';

/**
 * AccountConfigSection - Sección de configuración de cuenta
 *
 * Gestiona las diferentes opciones de configuración de la empresa:
 * - Perfil: Datos básicos, cambio de contraseña y completación de perfil
 * - Categorías: Selección de categorías y subcategorías de la empresa
 * - Precios de envío: Manejo de los precios de envío por ubicación
 * - Repartidores: Gestión de repartidores asociados
 * - Preferencias Web: Apariencia y configuración del catálogo web
 * - Suscripción: Gestión de plan y facturación (futuro)
 */
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
    removeLocation,
  } = useAccountConfig();

  const [showChangeLocationFlow, setShowChangeLocationFlow] = React.useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('📍 [AccountConfigSection] activeTab:', activeTab);
  }, [activeTab]);

  // Loading state
  if (loading) {
    return <AccountConfigSectionSkeleton />;
  }

  // Error state
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

  // Handlers
  const handleChangeLocation = async () => {
    const ubicacion = formData.ubicaciones?.[0];
    if (ubicacion?.id) {
      await removeLocation(ubicacion.id);
      setShowChangeLocationFlow(true);
    }
  };

  const handleLocationSaved = (
    empresaId: string,
    dto: { direccion: string; lat: number; lng: number }
  ) => {
    cargaUbicacionInicial(empresaId, dto);
    setShowChangeLocationFlow(false);
  };

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="account-shell">
      <AccountConfigSidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="acs-main card">
        <AccountConfigHeader
          hasChanges={hasChanges}
          saving={saving}
          error={error}
          success={success}
          onDiscard={resetForm}
        />

        <AccountConfigContent
          activeTab={activeTab}
          empresaId={empresaData.id}
          ubicacion={formData.ubicaciones?.[0]}
          showChangeLocationFlow={showChangeLocationFlow}
          onLocationSaved={handleLocationSaved}
          onChangeLocation={handleChangeLocation}
          onSetActiveTab={setActiveTab}
        />
      </main>
    </div>
  );
};

export default AccountConfigSection;
