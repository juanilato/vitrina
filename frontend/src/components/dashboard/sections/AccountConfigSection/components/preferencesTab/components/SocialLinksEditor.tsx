import React from "react";
import { SocialKey, SocialLink } from "../../../types";
import "./SocialLinksEditor.css";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const SOCIAL_OPTIONS: { key: SocialKey; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/tu_usuario" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/tu_pagina" },
  { key: "tiktok", label: "TikTok", placeholder: "https://www.tiktok.com/@tu_usuario" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/549..." },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/..." },
  { key: "x", label: "X (Twitter)", placeholder: "https://x.com/tu_usuario" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@tu_canal" },
  { key: "website", label: "Sitio Web", placeholder: "https://tusitio.com" },
  { key: "otros", label: "Otros", placeholder: "URL o handle" },
];

interface SocialLinksEditorProps {
  value: SocialLink[];
  onChange: (next: SocialLink[]) => void;
  label?: string;
}

const normalizeUrl = (v: string) => {
  const x = v.trim();
  if (!x) return "";
  if (x.startsWith("http://") || x.startsWith("https://")) return x;
  if (x.includes(".") && !x.includes(" ")) return `https://${x}`;
  return x;
};

const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({
  value,
  onChange,
  label = "Redes sociales",
}) => {
  const add = () => onChange([...value, { key: "instagram", label: "Instagram", value: "" }]);
  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));
  const update = (idx: number, patch: Partial<SocialLink>) => {
    const next = [...value];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <div className="social-editor card-like">
      <div className="social-header">
        <span className="social-title">{label}</span>

        {/* Botón Agregar estilo cnav */}
        <button
          type="button"
          className="cnav-chip-btn"
          onClick={add}
          title="Agregar enlace"
        >
          <span className="cnav-chip-icon"><AddIcon fontSize="small" /></span>
          <span className="cnav-chip-label">Agregar</span>
        </button>
      </div>

      <div className="social-list">
        {value.map((row, idx) => (
          <div key={idx} className="social-row">
            <select
              className="social-key"
              value={row.key}
              onChange={(e) => {
                const opt = SOCIAL_OPTIONS.find((o) => o.key === e.target.value);
                update(idx, {
                  key: e.target.value as SocialKey,
                  label: opt ? opt.label : row.label,
                });
              }}
              aria-label="Tipo de red social"
            >
              {SOCIAL_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>

            <input
              className="social-value"
              value={row.value}
              onChange={(e) => update(idx, { value: e.target.value })}
              onBlur={(e) => update(idx, { value: normalizeUrl(e.target.value) })}
              placeholder={
                SOCIAL_OPTIONS.find((o) => o.key === row.key)?.placeholder ||
                "URL o @handle"
              }
              aria-label="URL / usuario"
            />

            {/* Botón Eliminar estilo cnav (icon-only) */}
            <button
              type="button"
              className="cnav-iconbtn cnav-iconbtn--danger"
              onClick={() => remove(idx)}
              title="Eliminar enlace"
              aria-label="Eliminar enlace"
            >
              <RemoveIcon fontSize="small" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialLinksEditor;
