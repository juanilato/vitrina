
// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/company/site/components/SiteHeader.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import type { SiteTab } from '../CompanyStorePage';

export const SiteHeader: React.FC<{
  activeTab: SiteTab;
  onChangeTab: (t: SiteTab) => void;
  onBack: () => void;
  onCta: () => void;
}> = ({ activeTab, onChangeTab, onBack, onCta }) => {
  const tabs: { key: SiteTab; label: string }[] = [
    { key: 'home', label: 'Inicio' },
    { key: 'menu', label: 'Menú / Catálogo' },
    { key: 'about', label: 'Sobre' },
    { key: 'contact', label: 'Contacto' },
  ];

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <button className="back-btn-clean" onClick={onBack}>← Volver</button>
        <nav className="site-nav">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`site-nav-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => onChangeTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button className="cta-header" onClick={onCta}>Hacer pedido</button>
      </div>
    </header>
  );
};
