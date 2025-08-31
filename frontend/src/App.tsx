import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import CompanySelector from './components/company/CompanySelector';
import CompanyDashboard from './components/dashboard/CompanyDashboard';
import PrivateRoute from './components/auth/PrivateRoute';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
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
              path="/dashboard/products" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/analytics" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/settings" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/empresas" 
              element={
                <PrivateRoute>
                  <CompanySelector />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/empresa/:companyName" 
              element={
                <PrivateRoute>
                  <CompanyDashboard />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
