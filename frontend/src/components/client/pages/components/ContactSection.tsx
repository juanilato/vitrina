

// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/company/site/components/ContactSection.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';

export const ContactSection: React.FC<{
  phone?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  horarios?: { dia: string; abre: string; cierra: string }[];
  lat?: number;
  lng?: number;
}> = ({ phone, instagram, facebook, website, horarios, lat, lng }) => (
  <section className="contact">
    <div className="contact-info">
      <h2>Contacto</h2>
      <ul className="contact-list">
        {phone && <li>📞 {phone}</li>}
        {instagram && (
          <li>
            📷 <a href={instagram} target="_blank" rel="noreferrer">Instagram</a>
          </li>
        )}
        {facebook && (
          <li>
            📘 <a href={facebook} target="_blank" rel="noreferrer">Facebook</a>
          </li>
        )}
        {website && (
          <li>
            🌐 <a href={website} target="_blank" rel="noreferrer">Website</a>
          </li>
        )}
      </ul>

      {!!horarios?.length && (
        <>
          <h3>Horarios</h3>
          <ul className="hours-list">
            {horarios.map((h, i) => (
              <li key={i}>
                <span>{h.dia}</span>
                <span>
                  {h.abre} — {h.cierra}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>

    <div className="contact-map">
      {lat && lng ? (
        <iframe
          title="mapa"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${lat},${lng}&hl=es&z=15&output=embed`}
        />
      ) : (
        <div className="map-placeholder">Mapa no disponible</div>
      )}
    </div>
  </section>
);
