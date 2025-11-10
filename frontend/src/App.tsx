import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { LocationProvider } from './contexts/LocationContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';


import CompanyStorePage from './components/client/pages/CompanyStorePage';
import MyLocations from './components/client/pages/MyLocations';
import PrivateRoute from './components/auth/PrivateRoute';
import NotificationPopup from './components/common/NotificationPopup';
import './App.css';

// Componente para manejar la redirección inteligente desde la ruta raíz
const RootRedirect: React.FC = () => {
  const token = localStorage.getItem('token');
  
  if (token) {
    console.log('🔄 [ROOT REDIRECT] Token encontrado, redirigiendo al dashboard');
    return <Navigate to="/dashboard" replace />;
  } else {
    console.log('🔄 [ROOT REDIRECT] No hay token, redirigiendo al login');
    return <Navigate to="/login" replace />;
  }
};

// App envuelta
//      -> Auth Provider (autenticacion)
//          -> Locations Provider  (ubicaciones de usuario)
//            -> notificaciones
function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <NotificationsProvider>
          <Router>
            <div className="App">
              <NotificationPopup />
              <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/tienda/:companyName"
                element={
                  <PrivateRoute>
                    <CompanyStorePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/mis-ubicaciones"
                element={
                  <PrivateRoute>
                    <MyLocations />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<RootRedirect />} />
              </Routes>
            </div>
          </Router>
        </NotificationsProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
