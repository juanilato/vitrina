import React from 'react';
import './AccountTypeSelector.css';

interface AccountTypeSelectorProps {
  selectedType: 'empresa' | 'repartidor';
  onSelectType: (type: 'empresa' | 'repartidor') => void;
  onClose: () => void;
  onContinue: () => void;
}

const AccountTypeSelector: React.FC<AccountTypeSelectorProps> = ({
  selectedType,
  onSelectType,
  onClose,
  onContinue,
}) => {
  return (
    <div className="account-type-overlay">
      <div className="account-type-modal">
        <div className="account-type-header">
          <h2>Selecciona el tipo de cuenta</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="account-type-options">
          <button
            className={`account-type-card ${selectedType === 'empresa' ? 'selected' : ''}`}
            onClick={() => onSelectType('empresa')}
          >
            <div className="account-type-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3>Empresa</h3>
            <p>Muestra tus productos y servicios a miles de clientes</p>
          </button>

          <button
            className={`account-type-card ${selectedType === 'repartidor' ? 'selected' : ''}`}
            onClick={() => onSelectType('repartidor')}
          >
            <div className="account-type-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <h3>Repartidor</h3>
            <p>Realiza entregas y gana dinero con tu propio horario</p>
          </button>
        </div>

        <button
          className="continue-button"
          onClick={onContinue}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default AccountTypeSelector;
