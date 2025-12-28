import React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

interface AccountConfigHeaderProps {
  hasChanges: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  onSave?: () => void;
  onDiscard: () => void;
}

const AccountConfigHeader: React.FC<AccountConfigHeaderProps> = ({
  hasChanges,
  saving,
  error,
  success,
  onSave,
  onDiscard,
}) => {
  return (
    <header className="acs-header">
      <div className="acs-header-main">
        {hasChanges && (
          <div className="acs-actions">
            <button
              className="btn btn-secondary"
              onClick={onDiscard}
              disabled={saving}
            >
              Descartar cambios
            </button>
            <button
              className="btn btn-primary"
              onClick={onSave}
              disabled={saving}
            >
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
  );
};

export default AccountConfigHeader;
