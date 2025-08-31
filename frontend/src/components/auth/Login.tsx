import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { login, error, user } = useAuth();
  const navigate = useNavigate();

  // Verificar si el usuario ya está autenticado al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      console.log('🔄 [LOGIN COMPONENT] Usuario ya autenticado, redirigiendo al dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    console.log('🔐 [LOGIN COMPONENT] Iniciando submit del formulario');
    
    if (!email || !password) {
      console.log('⚠️ [LOGIN COMPONENT] Campos vacíos detectados');
      setFormError('Por favor completa todos los campos');
      return;
    }

    try {
      console.log('🚀 [LOGIN COMPONENT] Llamando a función login del AuthContext');
      setIsLoading(true);
      await login(email, password);
      
      console.log('✅ [LOGIN COMPONENT] Login exitoso, redirigiendo a dashboard');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('❌ [LOGIN COMPONENT] Error en login:', {
        message: err.message,
        error: err
      });
      setFormError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  console.log('🔄 [LOGIN COMPONENT] Renderizando componente Login', {
    email: email ? `${email.substring(0, 3)}...` : 'vacío',
    hasPassword: !!password,
    isLoading,
    hasFormError: !!formError,
    hasAuthError: !!error,
    hasUser: !!user,
    hasToken: !!localStorage.getItem('token')
  });

  return (
    <div className="auth-container">
      <div className="auth-split-panel">
        {/* Panel Izquierdo - Formulario de Login */}
        <div className="auth-form-panel login-mode">
          <div className="auth-form-container">
            <div className="auth-form active">
              <div className="auth-header">
  
                <div className="logo-container">

                <img src={'/vitrina-logo.png'} alt="Logo" />
                </div>
       
              </div>
              
              <form onSubmit={handleSubmit} className="auth-form-content">
                <div className="form-group">
                  <div className="input-wrapper">
                    <input
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Correo electronico"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="input-wrapper">
                    <input
                      type="password"
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Contraseña"
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
                  {isLoading ? 'Iniciando sesion...' : 'INICIAR SESION'}
                </button>
              </form>
              
              <div className="auth-footer">
                <p>
                  No tienes una cuenta?{' '}
                  <Link to="/register" className="auth-link">
                    Registrate ahora
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho - Visual Promocional */}
        <div className="auth-visual-panel login-mode">
          <div className="visual-content">
            <div className="logo-container">

              <div className="logo-text">VITRINA</div>
            </div>
            <div className="visual-text">
              <p>
                Tu vitrina digital para el mundo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
