import React, { useState, useEffect } from 'react';
import './VerificationModal.css';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  userType: 'cliente' | 'empresa';
  onVerificationSuccess: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  email,
  userType,
  onVerificationSuccess
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    console.log('VerificationModal - Estado cambiado:', { isOpen, email, userType });
  }, [isOpen, email, userType]);

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Por favor ingresa el código de verificación');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Verificando código:', { email, code: code.trim(), userType });
      
      const response = await fetch('http://localhost:3001/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: code.trim(),
          userType
        }),
      });

      const data = await response.json();
      console.log('Respuesta de verificación:', data);

      if (response.ok) {
        setSuccess('¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.');
        setTimeout(() => {
          onVerificationSuccess();
          onClose();
        }, 2000);
      } else {
        setError(data.message || 'Error al verificar el código');
      }
    } catch (error) {
      console.error('Error en verificación:', error);
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      console.log('Reenviando código para:', { email, userType });
      
      const response = await fetch('http://localhost:3001/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userType
        }),
      });

      const data = await response.json();
      console.log('Respuesta de reenvío:', data);

      if (response.ok) {
        setSuccess('Código reenviado exitosamente. Revisa tu email.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error al reenviar el código');
      }
    } catch (error) {
      console.error('Error en reenvío:', error);
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="verification-modal-overlay">
      <div className="verification-modal">
        <div className="verification-modal-header">
          <h2>Verificar Cuenta</h2>
          <button className="close-button" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="verification-modal-content">
          <p>
            Hemos enviado un código de verificación a <strong>{email}</strong>
          </p>
          <p>Por favor ingresa el código de 6 dígitos que recibiste:</p>

          <div className="code-input-container">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="code-input"
              autoComplete="one-time-code"
              inputMode="numeric"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="verification-actions">
            <button
              onClick={handleVerify}
              disabled={isLoading || !code.trim()}
              className="verify-button"
            >
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </button>

            <button
              onClick={handleResendCode}
              disabled={isResending}
              className="resend-button"
            >
              {isResending ? 'Reenviando...' : 'Reenviar Código'}
            </button>
          </div>

          <div className="verification-help">
            <p>¿No recibiste el código?</p>
            <ul>
              <li>Revisa tu carpeta de spam</li>
              <li>Verifica que el email sea correcto</li>
              <li>Haz clic en "Reenviar Código"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
