"use client";
import React, { useEffect, useState } from "react";

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
export const LiveSitePreview: React.FC<{ empresa?: { id?: string } }> = ({ empresa }) => {
  const [token, setToken] = useState<string | null>(null);
useEffect(() => {
  if (!empresa?.id) return;

  console.log('🌎 API URL:', process.env.NEXT_PUBLIC_API_URL);

  const url = `http://localhost:3001/empresas/preview-token/${empresa.id}`;
  console.log('🔗 Fetching token from:', url);

  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log('✅ Token recibido:', data);
      setToken(data.token);
    })
    .catch(err => console.error('❌ Error fetching token:', err));
}, [empresa?.id]);

  if (!empresa?.id || !token) return <p>Cargando vista previa...</p>;

  const src = `http://localhost:8081/company/${empresa.id}?previewToken=${token}`;

  return (
    <iframe
      src={src}
      title="Vista previa"
      style={{ border: 0, width: "100%", height: "100vh", borderRadius: 12 }}
    />
  );
};
