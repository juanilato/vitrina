import React from 'react';
import { useAuthOptimized } from '../../hooks/useAuthOptimized';
import { DashboardDataProvider } from '../../contexts/DashboardDataContext';
import { ErrorBoundary } from '../common';

import CompanyMainDashboard from './CompanyMainDashboard';
import RepartidorMainDashboard from './RepartidorMainDashboard';
import './DashboardRouter.css';

/**
 * DashboardRouter - Componente principal que decide qué dashboard mostrar
 * basado en el tipo de usuario autenticado
 */
const DashboardRouter: React.FC = () => {
  const { user, isCompany, isClient, isRepartidor } = useAuthOptimized();

  // Loading state
  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando su dashboard...</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on user type
  if (isCompany) {
    return (
      <ErrorBoundary>
        <DashboardDataProvider>
          <CompanyMainDashboard />
        </DashboardDataProvider>
      </ErrorBoundary>
    );
  }

  if (isRepartidor) {
    return (
      <ErrorBoundary>
        <RepartidorMainDashboard />
      </ErrorBoundary>
    );
  }

  // Fallback - shouldn't happen with proper auth
  return (
    <div className="dashboard-error">
      <h2>Error de Configuración</h2>
      <p>No se pudo determinar el tipo de usuario.</p>
    </div>
  );
};

export default DashboardRouter;
