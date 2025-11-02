import React, { useEffect, useState } from 'react';
import CompanyCard from './CompanyCard';
import axios from '../../../config/axios.config';
import { Company } from '../types';
import './SubcategoryCompaniesView.css';

interface SubcategoryCompaniesViewProps {
  subcategoryId: string;
  subcategoryName: string;
  onBack: () => void;
  onCompanyClick?: (companyId: string) => void;
}

export const SubcategoryCompaniesView: React.FC<SubcategoryCompaniesViewProps> = ({
  subcategoryId,
  subcategoryName,
  onBack,
  onCompanyClick,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, [subcategoryId]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/categorias/subcategorias/${subcategoryId}/empresas`);
      setCompanies(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="subcategory-companies-view">
        <div className="subcategory-header">
          <button className="back-button" onClick={onBack}>
            ← Volver
          </button>
          <h1 className="subcategory-title">{subcategoryName}</h1>
        </div>
        <div className="subcategory-loading">
          <div className="loading-spinner"></div>
          <p>Cargando empresas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subcategory-companies-view">
        <div className="subcategory-header">
          <button className="back-button" onClick={onBack}>
            ← Volver
          </button>
          <h1 className="subcategory-title">{subcategoryName}</h1>
        </div>
        <div className="subcategory-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchCompanies} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subcategory-companies-view">
      {/* Header */}
      <div className="subcategory-header">
        <button className="back-button" onClick={onBack}>
          ← Volver
        </button>
        <h1 className="subcategory-title">{subcategoryName}</h1>
        <p className="subcategory-count">
          {filteredCompanies.length} {filteredCompanies.length === 1 ? 'empresa' : 'empresas'}
        </p>
      </div>

      {/* Búsqueda */}
      <div className="subcategory-search">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar empresas..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Lista de empresas */}
      <div className="subcategory-content">
        {filteredCompanies.length > 0 ? (
          <div className="companies-list">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onViewCompany={() => onCompanyClick?.(company.id)}
                onViewProducts={() => onCompanyClick?.(company.id)}
              />
            ))}
          </div>
        ) : (
          <div className="subcategory-empty">
            <span className="empty-icon">🏪</span>
            <p>No se encontraron empresas</p>
          </div>
        )}
      </div>
    </div>
  );
};
