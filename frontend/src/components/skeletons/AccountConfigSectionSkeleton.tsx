import React from 'react';
import { SkeletonForm } from './SkeletonForm';
import { SkeletonTable } from './SkeletonTable';
import './SkeletonBase.css';

interface AccountConfigSectionSkeletonProps {
  activeTab?: 'profile' | 'categories' | 'shipping' | 'repartidores' | 'preferences' | 'subscription';
}

/**
 * Skeleton específico para AccountConfigSection
 * Cambia según el tab activo
 */
export const AccountConfigSectionSkeleton: React.FC<AccountConfigSectionSkeletonProps> = ({
  activeTab = 'profile'
}) => {
  return (
    <div className="account-config-skeleton" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton skeleton-text title skeleton-mb-2" style={{ width: '35%' }} />
        <div className="skeleton skeleton-text" style={{ width: '55%' }} />
      </div>

      {/* Tabs navigation */}
      <div className="skeleton-flex" style={{ gap: '16px', marginBottom: '32px', borderBottom: '2px solid #e0e0e0', paddingBottom: '16px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="skeleton skeleton-button small"
            style={{ opacity: i === 0 ? 1 : 0.6 }}
          />
        ))}
      </div>

      {/* Contenido según tab */}
      {activeTab === 'profile' && <ProfileTabSkeleton />}
      {activeTab === 'categories' && <CategoriesTabSkeleton />}
      {activeTab === 'shipping' && <ShippingTabSkeleton />}
      {activeTab === 'repartidores' && <RepartidoresTabSkeleton />}
      {activeTab === 'preferences' && <PreferencesTabSkeleton />}
      {activeTab === 'subscription' && <SubscriptionTabSkeleton />}
    </div>
  );
};

// Tab: Perfil y Seguridad
const ProfileTabSkeleton: React.FC = () => (
  <div className="skeleton-grid cols-2" style={{ gap: '32px' }}>
    <div>
      <div className="skeleton skeleton-text large skeleton-mb-3" style={{ width: '40%' }} />
      <SkeletonForm fields={5} hasImageUpload columns={1} />
    </div>
    <div>
      <div className="skeleton skeleton-text large skeleton-mb-3" style={{ width: '40%' }} />
      <SkeletonForm fields={3} columns={1} />
    </div>
  </div>
);

// Tab: Categorías
const CategoriesTabSkeleton: React.FC = () => (
  <div>
    <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginBottom: '24px' }}>
      <div className="skeleton skeleton-text large" style={{ width: '30%' }} />
      <div className="skeleton skeleton-button" />
    </div>

    {/* Lista de categorías */}
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="skeleton-card" style={{ marginBottom: '16px' }}>
        <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
          <div className="skeleton-flex" style={{ gap: '12px', flex: 1 }}>
            <div className="skeleton skeleton-icon large" />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '8px' }} />
              <div className="skeleton skeleton-text small" style={{ width: '60%' }} />
            </div>
          </div>
          <div className="skeleton-flex" style={{ gap: '8px' }}>
            <div className="skeleton skeleton-icon" />
            <div className="skeleton skeleton-icon" />
          </div>
        </div>

        {/* Subcategorías */}
        <div style={{ marginLeft: '56px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="skeleton-flex" style={{ justifyContent: 'space-between', padding: '8px', background: '#f8f8f8', borderRadius: '8px' }}>
              <div className="skeleton skeleton-text small" style={{ width: '30%' }} />
              <div className="skeleton skeleton-icon small" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Tab: Precios de Envío
const ShippingTabSkeleton: React.FC = () => (
  <div>
    <div className="skeleton skeleton-text large skeleton-mb-3" style={{ width: '35%' }} />

    <div className="skeleton-grid cols-2" style={{ gap: '24px' }}>
      {/* Mapa */}
      <div className="skeleton-card" style={{ minHeight: '400px' }}>
        <div className="skeleton skeleton-text skeleton-mb-2" style={{ width: '40%' }} />
        <div className="skeleton" style={{ width: '100%', height: '350px', borderRadius: '8px' }} />
      </div>

      {/* Lista de zonas */}
      <div>
        <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
          <div className="skeleton skeleton-text" style={{ width: '30%' }} />
          <div className="skeleton skeleton-button" />
        </div>

        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-card" style={{ marginBottom: '12px' }}>
            <div className="skeleton-flex" style={{ justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text skeleton-mb-1" style={{ width: '60%' }} />
                <div className="skeleton skeleton-text small" style={{ width: '40%' }} />
              </div>
              <div className="skeleton-flex" style={{ gap: '8px' }}>
                <div className="skeleton skeleton-badge" />
                <div className="skeleton skeleton-icon" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Tab: Repartidores
const RepartidoresTabSkeleton: React.FC = () => (
  <div>
    <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginBottom: '24px' }}>
      <div className="skeleton skeleton-text large" style={{ width: '30%' }} />
      <div className="skeleton skeleton-button" />
    </div>

    <SkeletonTable rows={6} columns={5} hasHeader hasActions />
  </div>
);

// Tab: Preferencias
const PreferencesTabSkeleton: React.FC = () => (
  <div className="skeleton-grid cols-2" style={{ gap: '32px' }}>
    {/* Columna izquierda: Formulario */}
    <div>
      <div className="skeleton skeleton-text large skeleton-mb-3" style={{ width: '50%' }} />

      {/* Sección de colores */}
      <div style={{ marginBottom: '24px' }}>
        <div className="skeleton skeleton-text skeleton-mb-2" style={{ width: '40%' }} />
        <div className="skeleton-flex" style={{ gap: '16px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-circle" style={{ width: '60px', height: '60px' }} />
          ))}
        </div>
      </div>

      {/* Logo */}
      <div style={{ marginBottom: '24px' }}>
        <div className="skeleton skeleton-text skeleton-mb-2" style={{ width: '30%' }} />
        <div className="skeleton skeleton-image square" style={{ width: '150px', paddingBottom: '150px' }} />
        <div className="skeleton skeleton-button small skeleton-mt-2" />
      </div>

      {/* Otros campos */}
      <SkeletonForm fields={4} hasTextarea hasSelect={false} hasImageUpload={false} />
    </div>

    {/* Columna derecha: Vista previa */}
    <div>
      <div className="skeleton skeleton-text large skeleton-mb-3" style={{ width: '40%' }} />
      <div className="skeleton-card" style={{ minHeight: '500px' }}>
        <div className="skeleton skeleton-image wide skeleton-mb-3" />
        <div className="skeleton skeleton-text title skeleton-mb-2" />
        <div className="skeleton-grid cols-2" style={{ gap: '12px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '12px' }} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Tab: Suscripción
const SubscriptionTabSkeleton: React.FC = () => (
  <div>
    <div className="skeleton skeleton-text title skeleton-mb-3" style={{ width: '40%' }} />

    {/* Plan actual */}
    <div className="skeleton-card" style={{ marginBottom: '32px', padding: '24px' }}>
      <div className="skeleton-flex" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-text large skeleton-mb-2" style={{ width: '40%' }} />
          <div className="skeleton skeleton-text skeleton-mb-1" style={{ width: '60%' }} />
          <div className="skeleton skeleton-text small" style={{ width: '50%' }} />
        </div>
        <div className="skeleton skeleton-badge" />
      </div>
      <div className="skeleton skeleton-button wide" style={{ maxWidth: '200px' }} />
    </div>

    {/* Planes disponibles */}
    <div className="skeleton skeleton-text large skeleton-mb-3" style={{ width: '30%' }} />
    <div className="skeleton-grid cols-3" style={{ gap: '24px' }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton-card" style={{ padding: '24px', textAlign: 'center' }}>
          <div className="skeleton skeleton-text large skeleton-mb-2" style={{ width: '60%', margin: '0 auto' }} />
          <div className="skeleton skeleton-text title skeleton-mb-2" style={{ width: '50%', margin: '0 auto 16px' }} />

          {/* Features */}
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="skeleton-flex" style={{ marginBottom: '12px', justifyContent: 'flex-start' }}>
              <div className="skeleton skeleton-icon small" style={{ marginRight: '8px' }} />
              <div className="skeleton skeleton-text small" style={{ width: '70%' }} />
            </div>
          ))}

          <div className="skeleton skeleton-button wide skeleton-mt-3" />
        </div>
      ))}
    </div>
  </div>
);

export default AccountConfigSectionSkeleton;
