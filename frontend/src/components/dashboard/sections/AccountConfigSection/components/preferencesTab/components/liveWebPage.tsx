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
export const LiveSitePreview: React.FC<{ empresa?: { id?: string; name?: string } }> = ({ empresa }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!empresa?.id) return;

    console.log('🌎 API URL:', process.env.NEXT_PUBLIC_API_URL);

    const url = `http://localhost:3001/auth/companies/preview-token/${empresa.id}`;
    console.log('🔗 Fetching token from:', url);

    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log('✅ Token recibido:', data);
        setToken(data.token);
      })
      .catch(err => console.error('❌ Error fetching token:', err));
  }, [empresa?.id]);

  if (!empresa?.id || !empresa?.name || !token) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: '#666'
      }}>
        <p>Cargando vista previa...</p>
      </div>
    );
  }

  // Usar el nombre de la empresa en la URL en lugar del ID
  const companyNameSlug = empresa.name.replace(/\s+/g, '');
  const src = `https://vitrina.com.ar/company/${companyNameSlug}?previewToken=${token}`;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Marco de dispositivo móvil */}
      <div style={{
        width: '375px',
        height: '812px',
        backgroundColor: '#000',
        borderRadius: '40px',
        padding: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Notch (muesca superior) */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '30px',
          backgroundColor: '#000',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
          zIndex: 10
        }} />

        {/* Pantalla del dispositivo */}
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
          borderRadius: '32px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <iframe
            src={src}
            title="Vista previa móvil"
            style={{
              border: 0,
              width: '100%',
              height: '100%',
              display: 'block'
            }}
          />
        </div>

        {/* Botón home (indicador inferior) */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '134px',
          height: '5px',
          backgroundColor: '#fff',
          borderRadius: '3px',
          opacity: 0.3
        }} />
      </div>

      {/* Información adicional */}
      <div style={{
        marginLeft: '30px',
        maxWidth: '300px',
        color: '#666'
      }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Vista Previa Móvil</h3>
        <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <strong>URL pública:</strong><br />
          <code style={{
            backgroundColor: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            display: 'inline-block',
            marginTop: '4px'
          }}>
            /company/{companyNameSlug}
          </code>
        </p>
        <p style={{ fontSize: '14px', lineHeight: '1.6', marginTop: '16px' }}>
          Esta es la vista que verán tus clientes en sus dispositivos móviles.
          La página es de acceso público y pueden agregar productos al carrito sin necesidad de registrarse.
        </p>
        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          fontSize: '13px'
        }}>
          <strong>💡 Tip:</strong> Los cambios en colores, fotos y horarios se reflejan en tiempo real.
        </div>
      </div>
    </div>
  );
};
