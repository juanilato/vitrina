import React, { useState } from 'react';
import useAccountConfig from '../hooks/useAccountConfig';

const PreferencesTab: React.FC = () => {
  const { empresaData, saving } = useAccountConfig();
  
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: true,
      orders: true,
      marketing: false
    },
    privacy: {
      showLocation: true,
      showContact: true,
      showProducts: true
    },
    display: {
      theme: 'light',
      language: 'es',
      timezone: 'America/Argentina/Buenos_Aires'
    }
  });

  const handlePreferenceChange = (category: string, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSavePreferences = async () => {
    // Aquí implementarías la lógica para guardar las preferencias
    console.log('Guardando preferencias:', preferences);
    // await updatePreferences(preferences);
  };

  return (
    <div className="preferences-tab">
      <div className="preferences-header">
        <h2>Preferencias de la Cuenta</h2>
        <p>Personaliza tu experiencia en la plataforma</p>
      </div>

      <div className="preferences-content">
        {/* Notifications Preferences */}
        <div className="preferences-section">
          <h3>Notificaciones</h3>
          <p className="section-description">
            Configura cómo y cuándo quieres recibir notificaciones
          </p>

          <div className="preferences-grid">
            <div className="preference-item">
              <div className="preference-info">
                <h4>Notificaciones por Email</h4>
                <p>Recibe notificaciones importantes por correo electrónico</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.notifications.email}
                  onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h4>Notificaciones Push</h4>
                <p>Recibe notificaciones en tiempo real en tu navegador</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.notifications.push}
                  onChange={(e) => handlePreferenceChange('notifications', 'push', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h4>Notificaciones de Pedidos</h4>
                <p>Recibe alertas cuando lleguen nuevos pedidos</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.notifications.orders}
                  onChange={(e) => handlePreferenceChange('notifications', 'orders', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h4>Notificaciones de Marketing</h4>
                <p>Recibe ofertas especiales y novedades de la plataforma</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.notifications.marketing}
                  onChange={(e) => handlePreferenceChange('notifications', 'marketing', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Preferences */}
        <div className="preferences-section">
          <h3>Privacidad</h3>
          <p className="section-description">
            Controla qué información es visible para los clientes
          </p>

          <div className="preferences-grid">
            <div className="preference-item">
              <div className="preference-info">
                <h4>Mostrar Ubicación</h4>
                <p>Permite que los clientes vean dónde está ubicada tu empresa</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.privacy.showLocation}
                  onChange={(e) => handlePreferenceChange('privacy', 'showLocation', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h4>Mostrar Información de Contacto</h4>
                <p>Permite que los clientes vean tu email y datos de contacto</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.privacy.showContact}
                  onChange={(e) => handlePreferenceChange('privacy', 'showContact', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h4>Mostrar Productos</h4>
                <p>Permite que los clientes vean tu catálogo de productos</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.privacy.showProducts}
                  onChange={(e) => handlePreferenceChange('privacy', 'showProducts', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Display Preferences */}
        <div className="preferences-section">
          <h3>Apariencia</h3>
          <p className="section-description">
            Personaliza la apariencia de tu dashboard
          </p>

          <div className="preferences-grid">
            <div className="preference-item">
              <div className="preference-info">
                <h4>Tema</h4>
                <p>Elige entre tema claro u oscuro</p>
              </div>
              <select
                value={preferences.display.theme}
                onChange={(e) => handlePreferenceChange('display', 'theme', e.target.value)}
                className="form-select"
              >
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h4>Idioma</h4>
                <p>Selecciona tu idioma preferido</p>
              </div>
              <select
                value={preferences.display.language}
                onChange={(e) => handlePreferenceChange('display', 'language', e.target.value)}
                className="form-select"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h4>Zona Horaria</h4>
                <p>Configura tu zona horaria local</p>
              </div>
              <select
                value={preferences.display.timezone}
                onChange={(e) => handlePreferenceChange('display', 'timezone', e.target.value)}
                className="form-select"
              >
                <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
                <option value="America/Argentina/Cordoba">Córdoba (GMT-3)</option>
                <option value="America/Argentina/Mendoza">Mendoza (GMT-3)</option>
                <option value="America/New_York">Nueva York (GMT-5)</option>
                <option value="Europe/Madrid">Madrid (GMT+1)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="preferences-actions">
          <button 
            className="btn btn-primary"
            onClick={handleSavePreferences}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Preferencias'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesTab;
