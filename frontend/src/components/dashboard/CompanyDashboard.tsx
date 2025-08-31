import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthOptimized } from '../../hooks/useAuthOptimized';
import DashboardHeader from './shared/DashboardHeader';
import MetricCard from './shared/MetricCard';
import WelcomeSection from './shared/WelcomeSection';
import './CompanyDashboard.css';
import NavigationHeader from '../layout/NavigationHeader';

interface CompanyData {
  id: string;
  name: string;
  description: string;
  logo: string;
  industry: string;
  employees: number;
  founded: string;
  revenue: string;
  status: 'active' | 'inactive' | 'pending';
}

interface CompanyDashboardProps {
  companyName?: string;
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ companyName: propCompanyName }) => {
  const { companyName: urlCompanyName } = useParams<{ companyName: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);

  // Usar el nombre de la empresa de la URL o del prop
  const currentCompanyName = urlCompanyName || propCompanyName || '';

  // Simulación de datos de empresa (en un caso real, esto vendría de una API)
  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos mock - en un caso real esto vendría de tu backend
      const mockData: CompanyData = {
        id: '1',
        name: currentCompanyName.charAt(0).toUpperCase() + currentCompanyName.slice(1),
        description: `Dashboard de la empresa ${currentCompanyName}. Aquí encontrarás toda la información relevante sobre la empresa, sus proyectos y métricas.`,
        logo: '/logo.png',
        industry: 'Tecnología',
        employees: Math.floor(Math.random() * 1000) + 50,
        founded: '2020',
        revenue: '$1M - $10M',
        status: 'active'
      };
      
      setCompanyData(mockData);
      setLoading(false);
    };

    if (currentCompanyName) {
      fetchCompanyData();
    }
  }, [currentCompanyName]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Información General</h3>
                <p><strong>Industria:</strong> {companyData?.industry}</p>
                <p><strong>Empleados:</strong> {companyData?.employees}</p>
                <p><strong>Fundada:</strong> {companyData?.founded}</p>
                <p><strong>Ingresos:</strong> {companyData?.revenue}</p>
                <p><strong>Estado:</strong> 
                  <span className={`status-badge status-${companyData?.status}`}>
                    {companyData?.status}
                  </span>
                </p>
              </div>
              <div className="overview-card">
                <h3>Descripción</h3>
                <p>{companyData?.description}</p>
              </div>
            </div>
          </div>
        );
      
      case 'projects':
        return (
          <div className="tab-content">
            <div className="projects-section">
              <h3>Proyectos Activos</h3>
              <div className="projects-grid">
                <div className="project-card">
                  <h4>Proyecto A</h4>
                  <p>Desarrollo de aplicación web</p>
                  <div className="project-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '75%' }}></div>
                    </div>
                    <span>75%</span>
                  </div>
                </div>
                <div className="project-card">
                  <h4>Proyecto B</h4>
                  <p>Implementación de CRM</p>
                  <div className="project-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '45%' }}></div>
                    </div>
                    <span>45%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="tab-content">
            <div className="analytics-section">
              <h3>Métricas y Análisis</h3>
              <div className="metrics-grid">
                <div className="metric-card">
                  <h4>Ventas Mensuales</h4>
                  <div className="metric-value">$125,000</div>
                  <div className="metric-change positive">+12.5%</div>
                </div>
                <div className="metric-card">
                  <h4>Clientes Activos</h4>
                  <div className="metric-value">1,247</div>
                  <div className="metric-change positive">+8.3%</div>
                </div>
                <div className="metric-card">
                  <h4>Tasa de Retención</h4>
                  <div className="metric-value">94.2%</div>
                  <div className="metric-change positive">+2.1%</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'team':
        return (
          <div className="tab-content">
            <div className="team-section">
              <h3>Equipo</h3>
              <div className="team-grid">
                <div className="team-member">
                  <div className="member-avatar">JD</div>
                  <h4>Juan Director</h4>
                  <p>CEO & Fundador</p>
                </div>
                <div className="team-member">
                  <div className="member-avatar">AM</div>
                  <h4>Ana Manager</h4>
                  <p>Directora de Operaciones</p>
                </div>
                <div className="team-member">
                  <div className="member-avatar">CD</div>
                  <h4>Carlos Dev</h4>
                  <p>Líder de Desarrollo</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div className="tab-content">Selecciona una pestaña</div>;
    }
  };

  if (loading) {
    return (
      <div className="company-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Cargando información de {currentCompanyName}...</p>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="company-dashboard error">
        <h2>Empresa no encontrada</h2>
        <p>No se pudo cargar la información de {currentCompanyName}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="company-dashboard">
      <NavigationHeader />
      
      {/* Header de la empresa */}
      <div className="company-header">
        <div className="company-info">
          <img src={companyData.logo} alt={`Logo de ${companyData.name}`} className="company-logo" />
          <div className="company-details">
            <h1>{companyData.name}</h1>
            <p className="company-subtitle">{companyData.industry} • {companyData.employees} empleados</p>
          </div>
        </div>
        <div className="company-actions">
          <button className="btn-secondary">Editar</button>
          <button className="btn-primary">Nuevo Proyecto</button>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Resumen
        </button>
        <button 
          className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => handleTabChange('projects')}
        >
          Proyectos
        </button>
        <button 
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleTabChange('analytics')}
        >
          Análisis
        </button>
        <button 
          className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => handleTabChange('team')}
        >
          Equipo
        </button>
      </div>

      {/* Contenido de la pestaña activa */}
      {renderTabContent()}

      {/* Navegación entre empresas */}
      <div className="company-navigation">
        <h3>Otras Empresas</h3>
        <div className="company-links">
          <button 
            onClick={() => navigate('/empresa/techcorp')}
            className={`company-link ${currentCompanyName === 'techcorp' ? 'active' : ''}`}
          >
            TechCorp
          </button>
          <button 
            onClick={() => navigate('/empresa/innovate')}
            className={`company-link ${currentCompanyName === 'innovate' ? 'active' : ''}`}
          >
            Innovate
          </button>
          <button 
            onClick={() => navigate('/empresa/startup')}
            className={`company-link ${currentCompanyName === 'startup' ? 'active' : ''}`}
          >
            Startup
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
