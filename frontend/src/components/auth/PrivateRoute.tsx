import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}
// Verifica usuario este en sesión para ingresar a página de usuario logeado
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('🛡️ [PRIVATE ROUTE] Estado de autenticación:', {
      hasUser: !!user,
      isLoading: loading,
      userType: user?.type,
      userName: user?.name
    });
  }, [user, loading]);

  if (loading) {
    console.log('⏳ [PRIVATE ROUTE] Cargando, mostrando spinner');
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-body">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner"></div>
              <p>Cargando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🚫 [PRIVATE ROUTE] Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ [PRIVATE ROUTE] Usuario autenticado, permitiendo acceso');
  return <>{children}</>;
};

export default PrivateRoute;
