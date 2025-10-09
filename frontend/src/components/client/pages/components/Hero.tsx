

// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/company/site/components/Hero.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';

export const Hero: React.FC<{
  coverImage?: string | null;
  logo?: string | null;
  name: string;
  description?: string | null;
  website?: string | null;
  onCta: () => void;
}> = ({ coverImage, logo, name, description, website, onCta }) => (
  <section className="hero">
    <div className="hero-media">
      {coverImage ? <img src={coverImage} alt={name} /> : <div className="hero-placeholder" />}
      <div className="hero-overlay" />
    </div>
    <div className="hero-content">
      <div className="hero-brand">
        <div className="hero-logo">
          {logo ? <img src={logo} alt={name} /> : <div className="company-logo-placeholder-clean">{name?.charAt(0)?.toUpperCase() || 'E'}</div>}
        </div>
        <div>
          <h1 className="hero-title">{name}</h1>
          {description && <p className="hero-subtitle">{description}</p>}
        </div>
      </div>
      <div className="hero-actions">
        <button className="btn btn-primary" onClick={onCta}>Ver Menú</button>
        <a className="btn outline" href={website || '#'} target="_blank" rel="noreferrer">Sitio Web</a>
      </div>
    </div>
  </section>
);
