import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axiosInstance from '../../../config/axios.config';
import './ProfileSettings.css';

interface ProfileData {
  name: string;
  email: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileSettings: React.FC = () => {
  const { user, logout } = useAuth();

  // Estado para los formularios
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Estados de loading y mensajes
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Estado para modo edición
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Handlers para actualizar perfil
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileMessage(null);

    try {
      const response = await axiosInstance.put('/auth/profile', {
        name: profileData.name,
        email: profileData.email,
      });

      setProfileMessage({ type: 'success', text: response.data.message || 'Perfil actualizado exitosamente' });
      setIsEditingProfile(false);

      // Actualizar el contexto si es necesario
      // Podrías necesitar recargar o actualizar el user en AuthContext
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Error al actualizar perfil';
      setProfileMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditingProfile(false);
    setProfileMessage(null);
  };

  // Handlers para cambiar contraseña
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);
    setPasswordMessage(null);

    // Validaciones básicas
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      setLoadingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      setLoadingPassword(false);
      return;
    }

    try {
      const response = await axiosInstance.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordMessage({ type: 'success', text: response.data.message || 'Contraseña actualizada exitosamente' });

      // Limpiar formulario
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Error al actualizar contraseña';
      setPasswordMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="profile-settings">
      <div className="profile-settings-header">
        <h1 className="settings-title">Configuración de Perfil</h1>
        <p className="settings-subtitle">Administra tu información personal y seguridad</p>
      </div>

      {/* Sección de Información Personal */}
      <div className="settings-section">
        <div className="section-header">
          <h2 className="section-title">Información Personal</h2>
          {!isEditingProfile && (
            <button
              className="edit-button"
              onClick={() => setIsEditingProfile(true)}
            >
              Editar
            </button>
          )}
        </div>

        <form onSubmit={handleProfileSubmit} className="settings-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Nombre Completo</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={profileData.name}
              onChange={handleProfileChange}
              disabled={!isEditingProfile || loadingProfile}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={profileData.email}
              onChange={handleProfileChange}
              disabled={!isEditingProfile || loadingProfile}
              required
            />
          </div>

          {profileMessage && (
            <div className={`message ${profileMessage.type}`}>
              {profileMessage.text}
            </div>
          )}

          {isEditingProfile && (
            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loadingProfile}
              >
                {loadingProfile ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancelEdit}
                disabled={loadingProfile}
              >
                Cancelar
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Sección de Seguridad */}
      <div className="settings-section">
        <div className="section-header">
          <h2 className="section-title">Seguridad</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="settings-form">
          <div className="form-group">
            <label htmlFor="currentPassword" className="form-label">Contraseña Actual</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              className="form-input"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              disabled={loadingPassword}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className="form-input"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              disabled={loadingPassword}
              required
              minLength={6}
            />
            <span className="form-hint">Mínimo 6 caracteres</span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              disabled={loadingPassword}
              required
              minLength={6}
            />
          </div>

          {passwordMessage && (
            <div className={`message ${passwordMessage.type}`}>
              {passwordMessage.text}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={loadingPassword}
            >
              {loadingPassword ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>

      {/* Sección de Acciones Peligrosas */}
      <div className="settings-section danger-zone">
        <div className="section-header">
          <h2 className="section-title">Zona de Peligro</h2>
        </div>

        <div className="danger-actions">
          <button
            className="btn-danger"
            onClick={logout}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
