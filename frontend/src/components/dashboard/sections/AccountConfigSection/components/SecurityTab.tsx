import React, { useState } from 'react';
import useAccountConfig from '../hooks/useAccountConfig';

const SecurityTab: React.FC = () => {
  const { changePassword, saving } = useAccountConfig();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert('Todos los campos son requeridos');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="security-tab">
      <div className="security-header">
        <h2>Seguridad de la Cuenta</h2>
        <p>Gestiona la seguridad y privacidad de tu cuenta</p>
      </div>

      <div className="security-content">
        {/* Change Password Section */}
        <div className="security-section">
          <h3>Cambiar Contraseña</h3>
          <p className="section-description">
            Para mantener tu cuenta segura, usa una contraseña fuerte y única.
          </p>

          <div className="password-form">
            <div className="form-group">
              <label htmlFor="current-password">Contraseña Actual</label>
              <div className="password-input-container">
                <input
                  id="current-password"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className="form-input"
                  placeholder="Ingresa tu contraseña actual"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="new-password">Nueva Contraseña</label>
              <div className="password-input-container">
                <input
                  id="new-password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="form-input"
                  placeholder="Ingresa tu nueva contraseña"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="password-requirements">
                <p>La contraseña debe tener al menos 6 caracteres</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirmar Nueva Contraseña</label>
              <div className="password-input-container">
                <input
                  id="confirm-password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="form-input"
                  placeholder="Confirma tu nueva contraseña"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button 
                className="btn btn-primary"
                onClick={handleChangePassword}
                disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </div>
        </div>

        {/* Security Tips */}
        <div className="security-section">
          <h3>Consejos de Seguridad</h3>
          <div className="security-tips">
            <div className="tip-item">
              <span className="tip-icon">🔒</span>
              <div className="tip-content">
                <h4>Usa una contraseña única</h4>
                <p>No reutilices contraseñas de otras cuentas</p>
              </div>
            </div>
            
            <div className="tip-item">
              <span className="tip-icon">🔑</span>
              <div className="tip-content">
                <h4>Combina letras, números y símbolos</h4>
                <p>Una contraseña fuerte es más difícil de adivinar</p>
              </div>
            </div>
            
            <div className="tip-item">
              <span className="tip-icon">🔄</span>
              <div className="tip-content">
                <h4>Cambia tu contraseña regularmente</h4>
                <p>Actualiza tu contraseña cada 3-6 meses</p>
              </div>
            </div>
            
            <div className="tip-item">
              <span className="tip-icon">🚫</span>
              <div className="tip-content">
                <h4>No compartas tu contraseña</h4>
                <p>Mantén tu contraseña privada y segura</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Security Status */}
        <div className="security-section">
          <h3>Estado de Seguridad</h3>
          <div className="security-status">
            <div className="status-item">
              <span className="status-icon">✅</span>
              <span className="status-text">Cuenta verificada</span>
            </div>
            
            <div className="status-item">
              <span className="status-icon">🔐</span>
              <span className="status-text">Contraseña configurada</span>
            </div>
            
            <div className="status-item">
              <span className="status-icon">📧</span>
              <span className="status-text">Email verificado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
