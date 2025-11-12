import React, { useState, useEffect } from 'react';
import useAccountConfig from '../hooks/useAccountConfig';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import BusinessIcon from '@mui/icons-material/Business';
import TuneIcon from '@mui/icons-material/Tune';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import './UnifiedProfileTab.css';

interface ProfileCompletionStatus {
  // Datos de empresa
  hasName: boolean;
  hasEmail: boolean;
  hasLogo: boolean;
  hasLocation: boolean;
  hasCategoria: boolean;
  hasSubcategorias: boolean;

  // Datos de preferencias
  hasColors: boolean;
  hasSchedule: boolean;
  hasSocialLinks: boolean;
  hasAlias: boolean;

  // Porcentajes
  empresaPercentage: number;
  preferenciasPercentage: number;
  overallPercentage: number;
}

const UnifiedProfileTab: React.FC = () => {
  const {
    empresaData,
    formData,
    saving,
    updateProfile,
    changePassword,
    setActiveTab,
  } = useAccountConfig();

  // Estado para nombre
  const [isEditingName, setIsEditingName] = useState(false);
  const [localName, setLocalName] = useState('');

  // Estado para contraseña
  const [showPasswordSection, setShowPasswordSection] = useState(false);
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

  // Inicializar nombre local cuando se carga empresaData
  useEffect(() => {
    if (empresaData?.name) {
      setLocalName(empresaData.name);
    }
  }, [empresaData?.name]);

  // Calcular estado de completación del perfil
  const getProfileCompletion = (): ProfileCompletionStatus => {
    const hasName = !!empresaData?.name;
    const hasEmail = !!empresaData?.email;
    const hasLogo = !!empresaData?.logo;
    const hasLocation = !!empresaData?.ubicaciones?.[0]?.direccion;
    const hasCategoria = !!empresaData?.categoriaId;
    const hasSubcategorias = (empresaData?.subcategorias?.length || 0) > 0;

    const hasColors = !!(empresaData?.preferenciasWeb?.colorBotones || empresaData?.preferenciasWeb?.colorFondo);
    const hasSchedule = (empresaData?.preferenciasWeb?.horarios?.length || 0) > 0;
    const hasSocialLinks = Array.isArray(empresaData?.redesSociales) && empresaData.redesSociales.length > 0;
    const hasAlias = !!empresaData?.alias;

    // Calcular porcentaje de datos de empresa (6 campos)
    const empresaFields = [hasName, hasEmail, hasLogo, hasLocation, hasCategoria, hasSubcategorias];
    const empresaCompleted = empresaFields.filter(Boolean).length;
    const empresaPercentage = Math.round((empresaCompleted / empresaFields.length) * 100);

    // Calcular porcentaje de datos de preferencias (4 campos)
    const preferenciasFields = [hasColors, hasSchedule, hasSocialLinks, hasAlias];
    const preferenciasCompleted = preferenciasFields.filter(Boolean).length;
    const preferenciasPercentage = Math.round((preferenciasCompleted / preferenciasFields.length) * 100);

    // Porcentaje global (10 campos en total)
    const overallPercentage = Math.round(((empresaCompleted + preferenciasCompleted) / (empresaFields.length + preferenciasFields.length)) * 100);

    return {
      hasName,
      hasEmail,
      hasLogo,
      hasLocation,
      hasCategoria,
      hasSubcategorias,
      hasColors,
      hasSchedule,
      hasSocialLinks,
      hasAlias,
      empresaPercentage,
      preferenciasPercentage,
      overallPercentage
    };
  };

  const completion = getProfileCompletion();

  // Handler para guardar nombre
  const handleSaveName = async () => {
    if (!localName.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }

    try {
      await updateProfile({ name: localName.trim() });
      setIsEditingName(false);
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
    }
  };

  // Handler para cancelar edición de nombre
  const handleCancelName = () => {
    setLocalName(empresaData?.name || '');
    setIsEditingName(false);
  };

  // Handler para cambiar contraseña
  const handleChangePassword = async () => {
    const isGoogleUser = empresaData?.authMethod === 'google';

    // Si NO es usuario de Google, la contraseña actual es requerida
    if (!isGoogleUser && !passwordData.currentPassword) {
      alert('La contraseña actual es requerida');
      return;
    }

    if (!passwordData.newPassword) {
      alert('La nueva contraseña es requerida');
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
      // Si es usuario de Google, pasar cadena vacía como contraseña actual
      const currentPwd = isGoogleUser ? '' : passwordData.currentPassword;
      await changePassword(currentPwd, passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordSection(false);
      alert(isGoogleUser
        ? 'Contraseña establecida exitosamente. Ahora puedes iniciar sesión con email y contraseña además de Google.'
        : 'Contraseña actualizada exitosamente');
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

  // Helper para renderizar ítem de checklist
  const renderCheckItem = (
    label: string,
    isComplete: boolean,
    onClick?: () => void
  ) => (
    <div
      className={`check-item ${isComplete ? 'completed' : 'incomplete'} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      {isComplete ? (
        <CheckCircleOutlineIcon className="check-icon completed" fontSize="small" />
      ) : (
        <RadioButtonUncheckedIcon className="check-icon incomplete" fontSize="small" />
      )}
      <span className="check-label">{label}</span>
      {onClick && (
        <ChevronRightIcon
          className="check-arrow"
          fontSize="small"
          style={{ marginLeft: 'auto', color: '#9CA3AF' }}
        />
      )}
    </div>
  );

  return (
    <div className="unified-profile-tab">
      {/* Header */}
      <div className="profile-header">
        <h2>Mi Perfil</h2>
        <p>Gestiona tu información personal y configuración de la cuenta</p>
      </div>

      {/* Barra de completación global */}
      <div className="profile-completion-card">
        <div className="completion-header">
          <h3>Completación del Perfil</h3>
          <span className="completion-percentage">{completion.overallPercentage}%</span>
        </div>

        {/* Barra de progreso similar a la de pedidos */}
        <div className="completion-timeline">
          <div
            className="completion-progress"
            style={{ width: `${completion.overallPercentage}%` }}
          />
        </div>

        <p className="completion-hint">
          {completion.overallPercentage === 100
            ? '¡Perfil completo! Tu cuenta está lista para funcionar al máximo.'
            : 'Completa tu perfil para mejorar la experiencia de tus clientes.'}
        </p>
      </div>

      {/* Sección de datos de empresa */}
      <div className="profile-section">
        <div className="section-header">
          <div className="section-title">
            <BusinessIcon className="section-icon" />
            <h3>Datos de Empresa</h3>
          </div>
          <div className="section-percentage">
            <span className={completion.empresaPercentage === 100 ? 'complete' : 'incomplete'}>
              {completion.empresaPercentage}% completo
            </span>
          </div>
        </div>

        <div className="checklist">
          {renderCheckItem('Nombre de empresa', completion.hasName, () => setIsEditingName(true))}
          {renderCheckItem('Email configurado', completion.hasEmail)}
          {renderCheckItem('Logo de empresa', completion.hasLogo, () => setActiveTab('preferences'))}
          {renderCheckItem('Ubicación registrada', completion.hasLocation, () => setActiveTab('locations'))}
          {renderCheckItem('Categoría asignada', completion.hasCategoria, () => setActiveTab('categories'))}
          {renderCheckItem('Subcategorías configuradas', completion.hasSubcategorias, () => setActiveTab('categories'))}
        </div>
      </div>

      {/* Sección de preferencias */}
      <div className="profile-section">
        <div className="section-header">
          <div className="section-title">
            <TuneIcon className="section-icon" />
            <h3>Preferencias y Personalización</h3>
          </div>
          <div className="section-percentage">
            <span className={completion.preferenciasPercentage === 100 ? 'complete' : 'incomplete'}>
              {completion.preferenciasPercentage}% completo
            </span>
          </div>
        </div>

        <div className="checklist">
          {renderCheckItem('Colores personalizados', completion.hasColors, () => setActiveTab('preferences'))}
          {renderCheckItem('Horarios de atención', completion.hasSchedule, () => setActiveTab('preferences'))}
          {renderCheckItem('Redes sociales', completion.hasSocialLinks, () => setActiveTab('preferences'))}
          {renderCheckItem('Alias personalizado', completion.hasAlias, () => setActiveTab('preferences'))}
        </div>
      </div>

      {/* Edición de nombre */}
      <div className="profile-section">
        <h3>Información Básica</h3>

        <div className="form-group">
          <label>Nombre de la Empresa</label>
          {isEditingName ? (
            <div className="edit-field-container">
              <input
                type="text"
                className="form-input"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="Ingresa el nombre de tu empresa"
                autoFocus
              />
              <div className="edit-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelName}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveName}
                  disabled={saving || !localName.trim()}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="display-field-container">
              <span className="display-value">{empresaData?.name || 'Sin nombre'}</span>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => setIsEditingName(true)}
              >
                Editar
              </button>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Email</label>
          <div className="display-field-container">
            <span className="display-value">{empresaData?.email || 'Sin email'}</span>
          </div>
        </div>
      </div>

      {/* Cambio de contraseña */}
      <div className="profile-section">
        <h3>Seguridad</h3>

        {!showPasswordSection ? (
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setShowPasswordSection(true)}
            >
              {empresaData?.authMethod === 'google' ? 'Establecer Contraseña' : 'Cambiar Contraseña'}
            </button>
            {empresaData?.authMethod === 'google' && (
              <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                Te registraste con Google. Puedes establecer una contraseña para también iniciar sesión con email y contraseña.
              </p>
            )}
          </>
        ) : (
          <div className="password-change-section">
            {empresaData?.authMethod !== 'google' && (
              <div className="form-group">
                <label htmlFor="current-password">Contraseña Actual</label>
                <div className="password-input-container">
                  <input
                    id="current-password"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="form-input"
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('current')}
                    aria-label="Mostrar/ocultar contraseña"
                  >
                    {showPasswords.current ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                  </button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="new-password">Nueva Contraseña</label>
              <div className="password-input-container">
                <input
                  id="new-password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="form-input"
                  placeholder="Ingresa tu nueva contraseña"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
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
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="form-input"
                  placeholder="Confirma tu nueva contraseña"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowPasswordSection(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleChangePassword}
                disabled={
                  saving ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword ||
                  (empresaData?.authMethod !== 'google' && !passwordData.currentPassword)
                }
              >
                {saving
                  ? 'Guardando...'
                  : empresaData?.authMethod === 'google'
                  ? 'Establecer Contraseña'
                  : 'Cambiar Contraseña'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Información de la cuenta */}
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
    </div>
  );
};

export default UnifiedProfileTab;
