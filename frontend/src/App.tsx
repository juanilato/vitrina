import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import { NotificationsProvider } from './contexts/NotificationsContext';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Landing from './components/landing/Landing';

import PrivateRoute from './components/auth/PrivateRoute';
import NotificationPopup from './components/common/NotificationPopup';
import './App.css';

// App envuelta
//      -> Auth Provider (autenticacion)
//         -> Location Provider (ubicaciones)
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
              <Route path="/" element={<Landing />} />
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
              </Routes>
            </div>
          </Router>
        </NotificationsProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
