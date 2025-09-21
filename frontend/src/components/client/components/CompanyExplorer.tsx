import React from 'react';
import { Company, ClientDashboardState } from '../types';
import CompanyCard from './CompanyCard';

interface CompanyExplorerProps {
  companies: Company[];
  state: ClientDashboardState;
  loading: boolean;
  onViewCompany: (companyId: string) => void;
  onUpdateSearch: (searchTerm: string) => void;
  onUpdateCategoryFilter: (category: string) => void;
  onUpdateSortBy: (sortBy: ClientDashboardState['sortBy']) => void;
}

const CompanyExplorer: React.FC<CompanyExplorerProps> = ({
  companies,
  state,
  loading,
  onViewCompany,
  onUpdateSearch,
  onUpdateCategoryFilter,
  onUpdateSortBy
}) => {

  return (
    <div className="company-explorer">
      {/* Explorer Header */}




      {/* Companies Grid */}
      <div className="companies-content">
        {loading ? (
          <div className="companies-loading">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando empresas...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="companies-empty">
            <div className="empty-icon">🏢</div>
            <h3 className="empty-title">No se encontraron empresas</h3>
            <p className="empty-description">
              {state.searchTerm || state.categoryFilter !== 'all'
                ? 'Intenta ajustar tus filtros de búsqueda'
                : 'Aún no hay empresas registradas en la plataforma'
              }
            </p>
            {(state.searchTerm || state.categoryFilter !== 'all') && (
              <button 
                className="btn btn-primary"
                onClick={() => {
                  onUpdateSearch('');
                  onUpdateCategoryFilter('all');
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="companies-grid">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onViewCompany={onViewCompany}
                onViewProducts={onViewCompany}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyExplorer;
