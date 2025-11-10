"use client";
import React from "react";

type EmpresaLite = {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
};

type Props = {
  empresa: EmpresaLite | null | undefined;
};
//Live webpage para empresa visualizar compania en vivo con sus preferencias 
export const LiveSitePreview: React.FC<Props> = ({ empresa }) => {
  if (!empresa?.id) return <p>No hay empresa cargada</p>;

  const src = `https://vitrina.com.ar/company/${empresa.id}`;

  return (
    <div className="live-preview-root">
      <iframe
        src={src}
        title="Vista previa del sitio"
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: "100vh" }}
      />
    </div>
  );
};
