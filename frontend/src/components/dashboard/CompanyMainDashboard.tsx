import React, { useState } from 'react';
import { useAuthOptimized } from '../../hooks/useAuthOptimized';
import CompanyNavbar from './shared/CompanyNavbar';
import MetricCard from './shared/MetricCard';
import WelcomeSection from './shared/WelcomeSection';
import ProductsSection from './sections/ProductsSection';
import OrdersSection from './sections/OrdersSection';
import './CompanyMainDashboard.css';

/**
 * CompanyMainDashboard - Dashboard principal para usuarios tipo empresa
 */
const CompanyMainDashboard: React.FC = () => {
  const { user, logout } = useAuthOptimized();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const welcomeActions = [
    {
      label: 'Nuevo Producto',
      icon: '+',
      onClick: () => console.log('Nuevo producto'),
      variant: 'primary' as const
    },
    {
      label: 'Ver Reportes',
      icon: '📊',
      onClick: () => console.log('Ver reportes'),
      variant: 'secondary' as const
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'productos':
        return <ProductsSection />;
      case 'pedidos':
        return <OrdersSection />;
      case 'estadisticas':
        return <div className="section-placeholder">📈 Sección de Estadísticas (próximamente)</div>;
      case 'dashboard':
      default:
        return (
          <main className="dashboard-main">
            <div className="dashboard-container">
              <WelcomeSection
                userName={user.name}
                userType="empresa"
                actions={welcomeActions}
              />

              {/* Métricas principales */}
              <section className="metrics-section">
                <div className="metrics-grid">
                  <MetricCard
                    icon="📦"
                    number="12"
                    label="Productos Activos"
                    trend={{ value: '+8%', type: 'positive' }}
                  />
                  <MetricCard
                    icon="👥"
                    number="1,247"
                    label="Visitas este mes"
                    trend={{ value: '+23%', type: 'positive' }}
                  />
                  <MetricCard
                    icon="💬"
                    number="89"
                    label="Consultas"
                    trend={{ value: '0%', type: 'neutral' }}
                  />
                  <MetricCard
                    icon="⭐"
                    number="4.8"
                    label="Rating Promedio"
                    trend={{ value: '+0.2', type: 'positive' }}
                  />
                </div>
              </section>

              {/* Contenido principal del dashboard */}
              <section className="dashboard-content">
                <div className="content-grid">
                  {/* Información de la empresa */}
                  <div className="content-card company-info">
                    <div className="card-header">
                      <h3 className="card-title">Información de la Empresa</h3>
                      <button className="edit-btn">✏️</button>
                    </div>
                    <div className="card-content">
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Nombre</span>
                          <span className="info-value">{user.name}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Email</span>
                          <span className="info-value">{user.email}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Tipo</span>
                          <span className="info-value">Empresa</span>
                        </div>
                        {user.logo && (
                          <div className="info-item logo-item">
                            <span className="info-label">Logo</span>
                            <div className="logo-preview">
                              <img src={user.logo} alt="Logo de la empresa" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gestión de productos */}
                  <div className="content-card products-management">
                    <div className="card-header">
                      <h3 className="card-title">Gestión de Productos</h3>
                      <span className="card-badge">12 activos</span>
                    </div>
                    <div className="card-content">
                      <div className="products-summary">
                        <div className="product-stats">
                          <div className="stat-item">
                            <span className="stat-number">8</span>
                            <span className="stat-label">En stock</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-number">3</span>
                            <span className="stat-label">Agotándose</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-number">1</span>
                            <span className="stat-label">Agotado</span>
                          </div>
                        </div>
                        <button 
                          className="btn btn-primary full-width"
                          onClick={() => setActiveSection('productos')}
                        >
                          <span className="btn-icon">+</span>
                          Gestionar Productos
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actividad reciente */}
                  <div className="content-card recent-activity">
                    <div className="card-header">
                      <h3 className="card-title">Actividad Reciente</h3>
                      <button className="view-all-btn">Ver todo</button>
                    </div>
                    <div className="card-content">
                      <div className="activity-list">
                        <div className="activity-item">
                          <div className="activity-icon">📦</div>
                          <div className="activity-content">
                            <span className="activity-text">Nuevo producto agregado: "Producto Premium"</span>
                            <span className="activity-time">Hace 2 horas</span>
                          </div>
                        </div>
                        <div className="activity-item">
                          <div className="activity-icon">👥</div>
                          <div className="activity-content">
                            <span className="activity-text">15 nuevas visitas a tu vitrina</span>
                            <span className="activity-time">Hace 4 horas</span>
                          </div>
                        </div>
                        <div className="activity-item">
                          <div className="activity-icon">💬</div>
                          <div className="activity-content">
                            <span className="activity-text">Nueva consulta recibida</span>
                            <span className="activity-time">Hace 6 horas</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico de visitas */}
                  <div className="content-card visits-chart">
                    <div className="card-header">
                      <h3 className="card-title">Visitas de la Semana</h3>
                      <div className="chart-controls">
                        <button className="chart-btn active">7D</button>
                        <button className="chart-btn">30D</button>
                        <button className="chart-btn">90D</button>
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="chart-placeholder">
                        <div className="chart-bars">
                          <div className="chart-bar" style={{height: '60%'}}></div>
                          <div className="chart-bar" style={{height: '80%'}}></div>
                          <div className="chart-bar" style={{height: '45%'}}></div>
                          <div className="chart-bar" style={{height: '90%'}}></div>
                          <div className="chart-bar" style={{height: '70%'}}></div>
                          <div className="chart-bar" style={{height: '85%'}}></div>
                          <div className="chart-bar" style={{height: '55%'}}></div>
                        </div>
                        <div className="chart-labels">
                          <span>Lun</span>
                          <span>Mar</span>
                          <span>Mié</span>
                          <span>Jue</span>
                          <span>Vie</span>
                          <span>Sáb</span>
                          <span>Dom</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>
        );
    }
  };

  return (
    <div className="company-main-dashboard">
      <CompanyNavbar 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onLogout={handleLogout}
      />
      
      {renderContent()}
    </div>
  );
};

export default CompanyMainDashboard;
