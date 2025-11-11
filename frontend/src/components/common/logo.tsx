// /components/VitrinaLogo.tsx
'use client';
import React from 'react';
import clsx from 'clsx'; // Opcional: si no usas clsx, quita clsx y concatena strings
import './logo';
type Props = {
  size?: number | string;     // px o cualquier unidad (e.g. "120px", "8rem")
  reducedMotion?: boolean;    // fuerza desactivar animación
  className?: string;         // clases extra
  label?: string;             // aria-label override
};

export default function Mariposa({
  size = 120,
  reducedMotion = false,
  className,
  label = 'Logo de Vitrina'
}: Props) {
  const style: React.CSSProperties = {
    width: typeof size === 'number' ? `${size}px` : size,
  };

  return (
    <div
      className={clsx('logoRoot', className)}
      style={style}
      role="img"
      aria-label={label}
      {...(reducedMotion ? { 'data-reduced-motion': '' } : {})}
    >
      {/* SVG inline para controlar alas por CSS */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 140 140"
        aria-hidden="true"
        focusable="false"
      >
        <title>{label}</title>
        <g id="logo" transform="translate(10,10)">
          {/* Ala derecha (atrás, naranja) */}
          <g className="wingRight" style={{ transformBox: 'fill-box', transformOrigin: '62% 56%' }}>
            <path fill="#FA8F27" d="M76 18c14 6 26 18 33 33 5 10 7 22 5 33-2 10-8 17-16 20-10 4-21-2-31-12-12-12-20-28-21-40-2-16 11-30 30-34z"/>
          </g>

          {/* Zona intermedia */}
          <path fill="#1B988A" d="M61 38c7-6 18-9 27-7 4 1 7 2 10 4-7 2-13 6-18 12-8 9-12 21-12 33-6-5-11-11-15-18-6-10-3-19 8-24z"/>

          {/* Ala izquierda (adelante) */}
          <g className="wingLeft" style={{ transformBox: 'fill-box', transformOrigin: '44% 60%' }}>
            <path fill="#05CC93" d="M26 24c14-7 31-5 43 6 8 7 14 18 14 30-1 10-6 19-14 26-9 7-22 10-35 8C17 90 7 77 8 62c1-17 8-30 18-38z"/>
          </g>

          {/* Parte inferior izquierda */}
          <path fill="#008C5A" d="M18 82c7 10 19 18 32 20 11 2 23 0 33-5-7 11-18 20-30 24-16 6-31 5-41-5-7-7-8-18 6-34z"/>

          {/* Punta izquierda */}
          <path fill="#FC9E1D" d="M26 22c3-2 7-4 11-5-2 4-3 8-4 12-1 4-1 8-1 12-4-7-6-13-6-19z"/>
        </g>
      </svg>
    </div>
  );
}
