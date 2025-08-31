import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../layout/NavigationHeader';
import './CompanySelector.css';

interface Company {
  id: string;
  name: string;
  slug: string;
  industry: string;
  logo: string;
  status: 'active' | 'inactive' | 'pending';
}

const CompanySelector: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  // Lista de empresas disponibles (en un caso real, esto vendría de una API)
  const companies: Company[] = [
    {
      id: '1',
      name: 'TechCorp',
      slug: 'techcorp',
      industry: 'Tecnología',
      logo: '/logo.png',
      status: 'active'
    },
    {
      id: '2',
      name: 'Innovate Solutions',
      slug: 'innovate',
      industry: 'Consultoría',
      logo: '/logo.png',
      status: 'active'
    },
    {
      id: '3',
      name: 'Startup Hub',
      slug: 'startup',
      industry: 'Fintech',
      logo: '/logo.png',
      status: 'active'
    },
    {
      id: '4',
      name: 'Digital Dynamics',
      slug: 'digital',
      industry: 'Marketing',
      logo: '/logo.png',
      status: 'pending'
    },
    {
      id: '5',
      name: 'Green Energy Co',
      slug: 'green',
      industry: 'Energía',
      logo: '/logo.png',
      status: 'active'
    },
    {
      id: '6',
      name: 'HealthTech Pro',
      slug: 'healthtech',
      industry: 'Salud',
      logo: '/logo.png',
      status: 'inactive'
    }
  ];

  const industries = ['all', ...Array.from(new Set(companies.map(c => c.industry)))];

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleCompanySelect = (companySlug: string) => {
    navigate(`/empresa/${companySlug}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#38a169';
      case 'inactive': return '#e53e3e';
      case 'pending': return '#dd6b20';
      default: return '#718096';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'inactive': return 'Inactiva';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="company-selector">
      <NavigationHeader />
      
      <div className="selector-header">
        <h2>Selecciona una Empresa</h2>
        <p>Navega entre los dashboards de las diferentes empresas</p>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Buscar empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="industry-filter">
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="industry-select"
          >
            {industries.map(industry => (
              <option key={industry} value={industry}>
                {industry === 'all' ? 'Todas las industrias' : industry}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de empresas */}
      <div className="companies-grid">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map(company => (
            <div
              key={company.id}
              className="company-card"
              onClick={() => handleCompanySelect(company.slug)}
            >
              <div className="company-card-header">
                <img src={company.logo} alt={`Logo de ${company.name}`} className="company-card-logo" />
                <div className="company-card-status">
                  <span 
                    className="status-dot"
                    style={{ backgroundColor: getStatusColor(company.status) }}
                  ></span>
                  <span className="status-text">{getStatusText(company.status)}</span>
                </div>
              </div>
              
              <div className="company-card-content">
                <h3 className="company-card-name">{company.name}</h3>
                <p className="company-card-industry">{company.industry}</p>
                <p className="company-card-slug">/{company.slug}</p>
              </div>
              
              <div className="company-card-footer">
                <button className="view-dashboard-btn">
                  Ver Dashboard
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <h3>No se encontraron empresas</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="stats-section">
        <div className="stat-card">
          <h4>Total Empresas</h4>
          <div className="stat-value">{companies.length}</div>
        </div>
        <div className="stat-card">
          <h4>Empresas Activas</h4>
          <div className="stat-value">{companies.filter(c => c.status === 'active').length}</div>
        </div>
        <div className="stat-card">
          <h4>Industrias</h4>
          <div className="stat-value">{industries.length - 1}</div>
        </div>
      </div>
    </div>
  );
};

export default CompanySelector;
