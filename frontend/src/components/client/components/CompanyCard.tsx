import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyCardProps } from '../types';
import { nameToUrlSlug } from '../../../utils/urlHelpers';
import './CompanyCard.css';

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onViewCompany,
  onViewProducts
}) => {
  const navigate = useNavigate();

  const handleViewCompany = () => {
    const urlSlug = nameToUrlSlug(company.name);
    navigate(`/tienda/${urlSlug}`);
  };

  const hasDashboardPhoto = company.preferenciasWeb?.dashboardFoto;

  // Variante A: Con Dashboard Photo (estilo mobile)
  if (hasDashboardPhoto) {
    return (
      <div
        className="company-card-mobile with-photo"
        onClick={handleViewCompany}
        style={{
          backgroundImage: `url(${company.preferenciasWeb?.dashboardFoto})`,
        }}
      >
        <div className="company-card-overlay"></div>
        <div className="company-card-content">
          {company.logo && (
            <div className="company-logo-center">
              <img src={company.logo} alt={company.name} />
            </div>
          )}
          <div className="company-name-chip">
            <span className="company-name-text">{company.name}</span>
          </div>
          {company.alias && (
            <p className="company-alias">@{company.alias}</p>
          )}
          <div className="company-arrow">→</div>
        </div>
      </div>
    );
  }

  // Variante B: Sin Dashboard Photo (diseño horizontal moderno)
  return (
    <div className="company-card-mobile horizontal" onClick={handleViewCompany}>
      <div className="company-logo-left">
        {company.logo ? (
          <img src={company.logo} alt={company.name} />
        ) : (
          <div className="company-logo-placeholder">
            {company.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="company-info-horizontal">
        <h3 className="company-name">{company.name}</h3>
        {company.description && (
          <p className="company-description">
            {company.description.length > 60
              ? `${company.description.substring(0, 60)}...`
              : company.description
            }
          </p>
        )}
        <div className="company-meta">
          {company.category && (
            <span className="company-category-badge">{company.category}</span>
          )}
          {company.rating && (
            <span className="company-rating">
              ⭐ {company.rating.toFixed(1)}
            </span>
          )}
        </div>
        {company.ubicacion && (
          <p className="company-location">
            📍 {company.ubicacion.ciudad}
          </p>
        )}
      </div>

      <div className="company-arrow-right">→</div>
    </div>
  );
};

export default CompanyCard;
