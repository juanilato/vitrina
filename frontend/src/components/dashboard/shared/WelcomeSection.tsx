import React from 'react';
import './WelcomeSection.css';

interface WelcomeSectionProps {
  userName: string;
  userType: 'empresa' | 'cliente';
  subtitle?: string;
  actions?: Array<{
    label: string;
    icon: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  userName,
  userType,
  subtitle,
  actions = []
}) => {
  const defaultSubtitle = userType === 'empresa' 
    ? `Aquí tienes un resumen de tu empresa y actividad reciente`
    : `Descubre las mejores vitrinas empresariales y encuentra lo que necesitas`;

  return (
    <section className="welcome-section">
      <div className="welcome-content">
        <h1 className="welcome-title">
          {userType === 'empresa' ? 'Bienvenido de vuelta' : '¡Hola'}, <span className="highlight">{userName}</span>{userType === 'cliente' ? '!' : ''}
        </h1>
        <p className="welcome-subtitle">
          {subtitle || defaultSubtitle}
        </p>
      </div>
      {actions.length > 0 && (
        <div className="welcome-actions">
          {actions.map((action, index) => (
            <button 
              key={index}
              className={`btn ${action.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}`}
              onClick={action.onClick}
            >
              <span className="btn-icon">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default WelcomeSection;
