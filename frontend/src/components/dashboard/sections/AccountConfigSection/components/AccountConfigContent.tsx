import React from 'react';
import { TabId } from './AccountConfigSidebar';
import { PreferencesTab, PreciosEnvioTab, CategoriesTab } from './';
import UnifiedProfileTab from './UnifiedProfileTab';
import ChargeUbicacionModule from './ChargeUbicacionModule';
import RepartidoresTab from './RepartidoresTab';
import SubscriptionTab from './SubscriptionTab';
import { UbicacionData } from '../types';

interface AccountConfigContentProps {
  activeTab: TabId;
  empresaId: string;
  ubicacion?: UbicacionData;
  showChangeLocationFlow: boolean;
  onLocationSaved: (empresaId: string, dto: { direccion: string; lat: number; lng: number }) => void;
  onChangeLocation: () => void;
  onSetActiveTab: (tab: TabId) => void;
}

const AccountConfigContent: React.FC<AccountConfigContentProps> = ({
  activeTab,
  empresaId,
  ubicacion,
  showChangeLocationFlow,
  onLocationSaved,
  onChangeLocation,
  onSetActiveTab,
}) => {
  console.log('🎨 [RENDER_ACTIVE_TAB] Tab actual:', activeTab, 'Ubicación:', ubicacion);

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':
        return <UnifiedProfileTab setActiveTab={onSetActiveTab} />;

      case 'categories':
        return <CategoriesTab />;

      case 'locations':
        if (!ubicacion || showChangeLocationFlow) {
          return (
            <ChargeUbicacionModule
              empresaId={empresaId}
              onSaved={onLocationSaved}
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
            onChangeLocation={onChangeLocation}
          />
        );

      case 'preferences':
        return <PreferencesTab />;

      case 'delivery':
        return <RepartidoresTab />;

      case 'subscription':
        return <SubscriptionTab />;

      default:
        return <UnifiedProfileTab setActiveTab={onSetActiveTab} />;
    }
  };

  return (
    <main className="acs-main card">
      <section className="acs-content">
        <div className="tab-card">{renderTab()}</div>
      </section>
    </main>
  );
};

export default AccountConfigContent;
