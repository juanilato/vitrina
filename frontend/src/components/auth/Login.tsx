import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

import { GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { login, googleLogin, error, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Por favor completa todos los campos');
      return;
    }
    try {
      setIsLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setFormError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async (cred: any) => {
    try {
      setIsLoading(true);
      const idToken = cred?.credential;
      if (!idToken) throw new Error('Token de Google inválido');
      await googleLogin(idToken);
      navigate('/dashboard');
    } catch (e: any) {
      setFormError(e.message || 'No se pudo iniciar con Google');
    } finally {
      setIsLoading(false);
    }
  };

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
                  <div className="error-message">{formError || error}</div>
                )}
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
                </button>
              </form>


              {/* Botón Google */}
              <div className="google-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogle}
                  onError={() => setFormError('Error con Google')}
                  useOneTap
                />
              </div>
              
              <div className="auth-footer">
                <p>
                  ¿No tienes una cuenta?{' '}
                  <Link to="/register" className="auth-link">
                    Regístrate ahora
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho */}
        <div className="auth-visual-panel login-mode">
          <div className="visual-content">
            <div className="logo-container">
              <div className="logo-text">VITRINA</div>
            </div>
            <div className="visual-text">
              <p>Tu vitrina digital para el mundo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
