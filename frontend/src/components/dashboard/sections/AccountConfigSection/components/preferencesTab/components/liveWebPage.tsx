"use client";
import React, { useMemo, useState } from "react";
import type { PreferencesState, DayKey, TimeSlot } from "../../../types";
import './liveWebPage.css';

// Tipos mínimos para no acoplar al fetch real
type Product = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  activo: boolean;
  fotoUrl?: string | null;
};

type Ubicacion = { lat?: number | null; lng?: number | null; direccion?: string | null };

type EmpresaLite = {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  ubicaciones?: Ubicacion[];
  // opcionales si vienen del back:
  products?: Product[];
  instagram?: string;
  facebook?: string;
  website?: string;
};

type Props = {
  empresa: EmpresaLite | null | undefined;
  prefs: PreferencesState;
};

// Mapa estático de días
const DAY_LABELS: Record<DayKey, string> = {
  LUN: "Lunes",
  MAR: "Martes",
  MIE: "Miércoles",
  JUE: "Jueves",
  VIE: "Viernes",
  SAB: "Sábado",
  DOM: "Domingo",
};

function toHoursList(schedule: Record<DayKey, TimeSlot[]>): { dia: string; abre: string; cierra: string }[] {
  const out: { dia: string; abre: string; cierra: string }[] = [];
  (Object.keys(schedule) as DayKey[]).forEach((key) => {
    const slots = schedule[key] || [];
    for (const s of slots) {
      out.push({ dia: DAY_LABELS[key], abre: s.open, cierra: s.close });
    }
  });
  return out;
}

/** Tarjeta simple para productos en preview */
const PreviewProductCard: React.FC<{ p: Product }> = ({ p }) => {
  return (
    <div className="preview-product-card">
      <div className="ppc-media">
        {p.fotoUrl ? (
          <img src={p.fotoUrl} alt={p.nombre} />
        ) : (
          <div className="ppc-placeholder">📦</div>
        )}
      </div>
      <div className="ppc-body">
        <div className="ppc-title">{p.nombre}</div>
        {p.descripcion && <div className="ppc-desc">{p.descripcion}</div>}
        <div className="ppc-price">
          {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(p.precio)}
        </div>
        <button className="ppc-btn">Agregar</button>
      </div>
    </div>
  );
};

const LiveSitePreview: React.FC<Props> = ({ empresa, prefs }) => {
  const [activeTab, setActiveTab] = useState<"home" | "menu" | "about" | "contact">("home");

  const hours = useMemo(() => toHoursList(prefs.schedule), [prefs.schedule]);

  const primary = prefs.colorBotones || "#0d6efd";
  const background = prefs.colorFondo || "#ffffff";

  const products = useMemo<Product[]>(
    () =>
      (empresa?.products || [])
        .filter((p) => p.activo)
        .slice(0, 8)
        .map((p) => ({ ...p, precio: Number(p.precio || 0) })),
    [empresa?.products]
  );

  const firstUbic = (empresa?.ubicaciones || [])[0];
  const lat = firstUbic?.lat ?? undefined;
  const lng = firstUbic?.lng ?? undefined;

  return (
    <div
      className="live-preview-root"
      style={
        {
          // tema mínimo en línea (podés llevarlo a CSS vars)
          "--preview-primary": primary,
          "--preview-bg": background,
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <header className="lp-header">
        <div className="lp-header-inner">
          <div className="lp-brand">
            <div className="lp-logo">
              {empresa?.logo ? (
                <img src={empresa.logo} alt={empresa?.name || "logo"} />
              ) : (
                <div className="lp-logo-placeholder">{empresa?.name?.charAt(0)?.toUpperCase() || "E"}</div>
              )}
            </div>
            <div className="lp-brand-meta">
              <div className="lp-title">{empresa?.name || "Tu Empresa"}</div>
              {empresa?.description && <div className="lp-subtitle">{empresa.description}</div>}
            </div>
          </div>

          <nav className="lp-nav">
            {[
              { key: "home", label: "Inicio" },
              { key: "menu", label: "Menú / Catálogo" },
              { key: "about", label: "Sobre" },
              { key: "contact", label: "Contacto" },
            ].map((t) => (
              <button
                key={t.key}
                className={`lp-nav-btn ${activeTab === (t.key as any) ? "active" : ""}`}
                onClick={() => setActiveTab(t.key as any)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-media">
          {prefs.dashboardFotoUrl ? (
            <img src={prefs.dashboardFotoUrl} alt="cover" />
          ) : (
            <div className="lp-hero-placeholder" />
          )}
          <div className="lp-hero-overlay" />
        </div>

        <div className="lp-hero-content">
          <h1 className="lp-hero-title">{empresa?.name || "Tu Empresa"}</h1>
          {empresa?.description && <p className="lp-hero-sub">{empresa.description}</p>}
          <div className="lp-hero-actions">
            <button className="btn-primary" onClick={() => setActiveTab("menu")}>
              Ver Menú
            </button>
            {empresa?.website && (
              <a className="btn-outline" href={empresa.website} target="_blank" rel="noreferrer">
                Sitio Web
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="lp-highlights">
        {(prefs.envioDomicilio
          ? [
              { icon: "🚚", title: "Envíos en la zona", desc: "Te lo llevamos a tu domicilio" },
              { icon: "⏰", title: "Horarios amplios", desc: "Consultá disponibilidad" },
              { icon: "💳", title: "Pagá como quieras", desc: "Efectivo / Transferencia" },
            ]
          : [
              { icon: "🏪", title: "Retiro en local", desc: "Coordiná tu pickup" },
              { icon: "⏰", title: "Horarios amplios", desc: "Consultá disponibilidad" },
              { icon: "💳", title: "Pagá como quieras", desc: "Efectivo / Transferencia" },
            ]
        ).map((h, i) => (
          <div className="lp-h-card" key={i}>
            <div className="lp-h-icon">{h.icon}</div>
            <div className="lp-h-body">
              <div className="lp-h-title">{h.title}</div>
              <div className="lp-h-desc">{h.desc}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Main según tab */}
      <main className="lp-main">
        {activeTab === "home" && (
          <div className="lp-home-grid">
            <div className="lp-panel">
              <h3>Novedades</h3>
              <p>Así se verán tus anuncios, promos y avisos importantes.</p>
            </div>
            <div className="lp-panel">
              <h3>Destacados</h3>
              <div className="lp-products-grid">
                {(products.length ? products.slice(0, 4) : getPlaceholders()).map((p) => (
                  <PreviewProductCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <section className="lp-products-section">
            <h2 className="lp-section-title">Menú / Catálogo</h2>
            <div className="lp-products-grid">
              {(products.length ? products : getPlaceholders()).map((p) => (
                <PreviewProductCard key={p.id} p={p} />
              ))}
            </div>
          </section>
        )}

        {activeTab === "about" && (
          <section className="lp-about">
            <div className="lp-about-text">
              <h2>Sobre {empresa?.name || "tu empresa"}</h2>
              <p>
                {empresa?.description ||
                  "Agregá una descripción en tu panel y se verá aquí. Contá tu historia, misión y valores."}
              </p>
            </div>
          </section>
        )}

        {activeTab === "contact" && (
          <section className="lp-contact">
            <div className="lp-contact-info">
              <h2>Contacto</h2>
              <ul className="lp-contact-list">
                {empresa?.instagram && (
                  <li>
                    📷 <a href={empresa.instagram} target="_blank" rel="noreferrer">Instagram</a>
                  </li>
                )}
                {empresa?.facebook && (
                  <li>
                    📘 <a href={empresa.facebook} target="_blank" rel="noreferrer">Facebook</a>
                  </li>
                )}
                {empresa?.website && (
                  <li>
                    🌐 <a href={empresa.website} target="_blank" rel="noreferrer">Website</a>
                  </li>
                )}
              </ul>

              {!!hours.length && (
                <>
                  <h3>Horarios</h3>
                  <ul className="lp-hours">
                    {hours.map((h, i) => (
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

            <div className="lp-contact-map">
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
                <div className="lp-map-placeholder">Mapa no disponible</div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="lp-footer">
        <div>© {new Date().getFullYear()} {empresa?.name || "Tu Empresa"}.</div>
        <div className="lp-footer-links">
          {empresa?.instagram && <a href={empresa.instagram} target="_blank" rel="noreferrer">Instagram</a>}
          {empresa?.facebook && <a href={empresa.facebook} target="_blank" rel="noreferrer">Facebook</a>}
          {empresa?.website && <a href={empresa.website} target="_blank" rel="noreferrer">Website</a>}
        </div>
      </footer>
    </div>
  );
};

export default LiveSitePreview;

// Helpers
function getPlaceholders(): Product[] {
  return [
    { id: "ph1", nombre: "Producto de ejemplo", precio: 1000, activo: true },
    { id: "ph2", nombre: "Producto destacado", precio: 2500, activo: true },
    { id: "ph3", nombre: "Nuevo lanzamiento", precio: 1800, activo: true },
    { id: "ph4", nombre: "Edición limitada", precio: 3200, activo: true },
  ];
}
