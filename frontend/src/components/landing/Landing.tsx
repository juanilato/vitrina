import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, TrendingUp, Clock, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import './Landing.css';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Store size={32} />,
      title: 'Gestión Integral',
      description: 'Administra productos, pedidos y entregas desde un solo lugar.'
    },
    {
      icon: <TrendingUp size={32} />,
      title: 'Aumenta tus Ventas',
      description: 'Llega a más clientes y optimiza tu operación comercial.'
    },
    {
      icon: <Clock size={32} />,
      title: 'Tiempo Real',
      description: 'Seguimiento en vivo de pedidos y repartidores.'
    },
    {
      icon: <Shield size={32} />,
      title: 'Seguro y Confiable',
      description: 'Plataforma robusta con datos protegidos.'
    }
  ];

  const benefits = [
    'Panel de control intuitivo',
    'Gestión de inventario automatizada',
    'Sistema de pedidos eficiente',
    'Reportes y estadísticas detalladas',
    'Notificaciones en tiempo real',
    'Soporte dedicado para empresas'
  ];

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <Store size={16} />
              <span>SOLUCIÓN PARA EMPRESAS</span>
            </div>
            <h1 className="hero-title">
              Potencia tu <br />
              <span className="hero-title-accent">Negocio Digital</span>
            </h1>
            <p className="hero-description">
              La plataforma completa para gestionar tu empresa de delivery y comercio.
              Control total de productos, pedidos y entregas en tiempo real.
            </p>
            <div className="hero-buttons">
              <button
                className="btn btn-hero-primary"
                onClick={() => navigate('/register')}
              >
                Comenzar Ahora
                <ArrowRight size={20} />
              </button>
              <button
                className="btn btn-hero-secondary"
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </button>
            </div>
          </div>

          <div className="hero-image">
            <div className="hero-image-card">
              <div className="hero-image-content">
                <div className="stats-mini">
                  <div className="stat-item">
                    <span className="stat-number">100+</span>
                    <span className="stat-label">Empresas</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">24/7</span>
                    <span className="stat-label">Disponible</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              Todo lo que necesitas para crecer
            </h2>
            <p className="section-description">
              Una plataforma integral diseñada para optimizar tu operación comercial.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="section-container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="section-title">
                ¿Por qué elegir Vitrina?
              </h2>
              <p className="section-description">
                Nuestra plataforma está diseñada específicamente para empresas que buscan
                profesionalizar y escalar su operación de delivery.
              </p>

              <div className="benefits-list">
                {benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <CheckCircle size={20} className="benefit-icon" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-primary btn-large"
                onClick={() => navigate('/register')}
              >
                Crear Cuenta Empresarial
                <ArrowRight size={20} />
              </button>
            </div>

            <div className="benefits-image">
              <div className="benefits-card">
                <div className="benefits-card-header">
                  <div className="benefits-card-dot"></div>
                  <div className="benefits-card-dot"></div>
                  <div className="benefits-card-dot"></div>
                </div>
                <div className="benefits-card-body">
                  <div className="dashboard-preview">
                    <div className="dashboard-stat">
                      <span className="dashboard-label">Pedidos Hoy</span>
                      <span className="dashboard-value">47</span>
                      <span className="dashboard-trend">+12%</span>
                    </div>
                    <div className="dashboard-stat">
                      <span className="dashboard-label">Ingresos</span>
                      <span className="dashboard-value">$3,450</span>
                      <span className="dashboard-trend">+8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2 className="cta-title">
              Comienza a digitalizar tu negocio hoy
            </h2>
            <p className="cta-description">
              Únete a las empresas que ya están potenciando sus operaciones con Vitrina.
            </p>
            <div className="cta-buttons">
              <button
                className="btn btn-cta-primary"
                onClick={() => navigate('/register')}
              >
                Registrarse Gratis
                <ArrowRight size={20} />
              </button>
              <button
                className="btn btn-cta-secondary"
                onClick={() => navigate('/login')}
              >
                Ya tengo cuenta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Vitrina. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Landing;
