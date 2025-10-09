
// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/company/site/components/Highlights.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';

export type Highlight = { icon?: string; title: string; desc?: string };

export const Highlights: React.FC<{ highlights?: Highlight[]; fallback: Highlight[] }> = ({ highlights, fallback }) => (
  <section className="highlights">
    {(highlights?.length ? highlights : fallback).slice(0, 4).map((h, idx) => (
      <div className="highlight-card" key={idx}>
        <div className="highlight-icon">{h.icon || '⭐'}</div>
        <div className="highlight-body">
          <h4>{h.title}</h4>
          {h.desc && <p>{h.desc}</p>}
        </div>
      </div>
    ))}
  </section>
);

