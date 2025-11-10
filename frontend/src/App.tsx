import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';



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
//         
//            -> notificaciones
function App() {
  return (
    <AuthProvider>
 
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



              <Route path="/" element={<RootRedirect />} />
              </Routes>
            </div>
          </Router>
        </NotificationsProvider>
 
    </AuthProvider>
  );
}

export default App;
