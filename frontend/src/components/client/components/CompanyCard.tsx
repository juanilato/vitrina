import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyCardProps } from '../types';
import { nameToUrlSlug } from '../../../utils/urlHelpers';

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

  return (
    <div className="company-card-elegant" onClick={handleViewCompany}>
      {/* Company Avatar */}
      <div className="company-avatar-elegant">
        {company.logo ? (
          <img src={company.logo} alt={company.name} className="company-logo-elegant" />
        ) : (
          <div className="company-logo-placeholder-elegant">
            {company.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      {/* Company Info */}
      <div className="company-info-elegant">
        <h3 className="company-name-elegant">{company.name}</h3>
        {company.category && (
          <span className="company-category-elegant">{company.category}</span>
        )}
        {company.description && (
          <p className="company-description-elegant">
            {company.description.length > 80 
              ? `${company.description.substring(0, 80)}...`
              : company.description
            }
          </p>
        )}
      </div>


    </div>
  );
};

export default CompanyCard;
