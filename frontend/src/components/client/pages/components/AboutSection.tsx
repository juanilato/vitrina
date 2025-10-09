
// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/company/site/components/AboutSection.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';

export const AboutSection: React.FC<{
  name: string;
  description?: string | null;
  gallery?: string[];
}> = ({ name, description, gallery }) => (
  <section className="about">
    <div className="about-text">
      <h2>Sobre {name}</h2>
      <p>{description || 'Somos una empresa comprometida con la calidad y la atención a nuestros clientes.'}</p>
    </div>
    {!!gallery?.length && (
      <div className="about-gallery">
        {gallery.map((src, i) => (
          <img key={i} src={src} alt={`galería-${i}`} />
        ))}
      </div>
    )}
  </section>
);
