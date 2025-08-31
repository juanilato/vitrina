import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VerificationModal from './VerificationModal';
import './Register.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    type: 'empresa' as 'cliente' | 'empresa',
    logo: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<{
    email: string;
    type: 'cliente' | 'empresa';
  } | null>(null);
  
  const { register, error, user } = useAuth();
  const navigate = useNavigate();

  // Verificar si el usuario ya está autenticado al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      console.log('🔄 [REGISTER COMPONENT] Usuario ya autenticado, redirigiendo al dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Validation
    if (!formData.email || !formData.name || !formData.password || !formData.confirmPassword) {
      setFormError('Por favor complete todos los campos requeridos');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setIsLoading(true);
      const { confirmPassword, ...registerData } = formData;
      console.log('Registrando usuario:', registerData);
      
      // Llamar a la función register del contexto
      const result = await register(registerData);
      console.log('Resultado del registro:', result);
      
      console.log('Registro exitoso, mostrando modal de verificación');
      
      // Mostrar modal de verificación en lugar de navegar directamente
      setRegisteredUser({
        email: formData.email,
        type: formData.type
      });
      setShowVerificationModal(true);
      
      console.log('Estado del modal:', { showVerificationModal, registeredUser });
      
    } catch (err: any) {
      console.error('Error en registro:', err);
      setFormError(err.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    console.log('Verificación exitosa, redirigiendo al dashboard');
    // Redirigir al dashboard después de verificación exitosa
    navigate('/dashboard');
  };

  const handleCloseVerificationModal = () => {
    console.log('Cerrando modal de verificación');
    setShowVerificationModal(false);
    setRegisteredUser(null);
  };

  console.log('🔄 [REGISTER COMPONENT] Renderizando componente Register', {
    hasUser: !!user,
    hasToken: !!localStorage.getItem('token'),
    showVerificationModal,
    hasRegisteredUser: !!registeredUser
  });

  return (
    <>
      <div className="auth-container">
        <div className="auth-split-panel">
          {/* Panel Izquierdo - Formulario de Registro */}
          <div className="auth-form-panel register-mode">
            <div className="auth-form-container">
              <div className="auth-form active">
       
                
                <form onSubmit={handleSubmit} className="auth-form-content">
                  <div className="form-group">
                    <div className="input-wrapper">
                      <select
                        name="type"
                        className="form-input"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                      >
                        <option value="empresa">Empresa</option>
                        <option value="cliente">Cliente</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <div className="input-wrapper">
                      <input
                        type="text"
                        name="name"
                        className="form-input"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={formData.type === 'empresa' ? 'Company Name' : 'Full Name'}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <div className="input-wrapper">
                      <input
                        type="email"
                        name="email"
                        className="form-input"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  

                  
                  <div className="form-group">
                    <div className="input-wrapper">
                      <input
                        type="password"
                        name="password"
                        className="form-input"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Contraseña"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <div className="input-wrapper">
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-input"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirmar contraseña"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  {(formError || error) && (
                    <div className="error-message">
                      {formError || error}
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creando cuenta...' : 'REGISTRATE'}
                  </button>
                </form>
                
                <div className="auth-footer">
                  <p>
                    Ya tienes una cuenta?{' '}
                    <Link to="/login" className="auth-link">
                      Inicia sesion ahora
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Derecho - Visual Promocional */}
          <div className="auth-visual-panel register-mode">
            <div className="visual-content">
              <div className="logo-container">
                  <img src={'/vitrina-logo.png'} alt="Logo" />
                <div className="logo-text">VITRINA</div>
              </div>
              <div className="visual-text">
                <p>
                  Sumate a las miles de empresas que ya estan en VITRINA, mostrandote a tu publico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Verificación */}
      {showVerificationModal && registeredUser && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={handleCloseVerificationModal}
          email={registeredUser.email}
          userType={registeredUser.type}
          onVerificationSuccess={handleVerificationSuccess}
        />
      )}
    </>
  );
};

export default Register;
