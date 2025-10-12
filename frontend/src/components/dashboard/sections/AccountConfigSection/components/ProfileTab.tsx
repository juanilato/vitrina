import React, { useState, useRef } from 'react';
import useAccountConfig from '../hooks/useAccountConfig';
import ImageUploader from './preferencesTab/components/imageUploader';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
const ProfileTab: React.FC = () => {
  const {
    empresaData,
    formData,
    saving,
    updateProfile,
    uploadFoto
  } = useAccountConfig();

  const [isEditing, setIsEditing] = useState(false);
  const [localFormData, setLocalFormData] = useState({
    name: formData.name,
    email: formData.email,
    logo: formData.logo
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setLocalFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name: localFormData.name,
        email: localFormData.email,
        logo: localFormData.logo
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    }
  };

  const handleCancel = () => {
    setLocalFormData({
      name: formData.name,
      email: formData.email,
      logo: formData.logo
    });
    setIsEditing(false);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    try {
      const logoUrl = await uploadFoto(file, false);
      setLocalFormData(prev => ({
        ...prev,
        logo: logoUrl
      }));
    } catch (error) {
      console.error('Error al subir logo:', error);
      alert('Error al subir el logo');
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="profile-tab">
      <div className="profile-header">
        <h2>Información del Perfil</h2>
        <p>Gestiona la información básica de tu empresa</p>
      </div>

      <div className="profile-content">
        {/* Logo Section */}
        <div className="profile-section">
          <h3>Logo de la Empresa</h3>
   <ImageUploader
  imageUrl={localFormData.logo}
  onUpload={async (file) => {
    const logoUrl = await uploadFoto(file, false); // ya la tenés
    setLocalFormData(prev => ({ ...prev, logo: logoUrl }));
  }}
  onRemove={() => setLocalFormData(prev => ({ ...prev, logo: '' }))}
  disabled={saving}
/>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Basic Information */}
        <div className="profile-section">
          <h3>Información Básica</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="company-name">Nombre de la Empresa</label>
              <input
                id="company-name"
                type="text"
                value={localFormData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing || saving}
                className="form-input"
                placeholder="Ingresa el nombre de tu empresa"
              />
            </div>

            <div className="form-group">
              <label htmlFor="company-email">Email</label>
              <input
                id="company-email"
                type="email"
                value={localFormData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing || saving}
                className="form-input"
                placeholder="email@empresa.com"
              />
            </div>
          </div>

          {/* Verification Status */}
<div className="verification-status">
  <div className={`status-badge ${empresaData?.isVerified ? 'verified' : 'pending'}`}>
    {empresaData?.isVerified ? (
      <CheckCircleOutlineOutlinedIcon className="inline-icon" />
    ) : (
      <ScheduleOutlinedIcon className="inline-icon" />
    )}
    <span className="status-text">
      {empresaData?.isVerified ? 'Cuenta verificada' : 'Pendiente de verificación'}
    </span>
  </div>
  {!empresaData?.isVerified && (
    <p className="verification-note muted">
      Tu cuenta está pendiente de verificación. Revisá tu email para completar el proceso.
    </p>
  )}
</div>

        </div>

        {/* Account Info */}
        <div className="profile-section">
          <h3>Información de la Cuenta</h3>
          
          <div className="account-info-grid">
            <div className="info-item">
              <span className="info-label">ID de Empresa</span>
              <span className="info-value">{empresaData?.id}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Fecha de Registro</span>
              <span className="info-value">
                {empresaData?.createdAt ? new Date(empresaData.createdAt).toLocaleDateString('es-AR') : 'N/A'}
              </span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Última Actualización</span>
              <span className="info-value">
                {empresaData?.updatedAt ? new Date(empresaData.updatedAt).toLocaleDateString('es-AR') : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          {!isEditing ? (
            <button 
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              Editar Perfil
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
