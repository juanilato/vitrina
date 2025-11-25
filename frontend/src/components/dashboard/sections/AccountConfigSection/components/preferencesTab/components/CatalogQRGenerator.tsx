import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { getCatalogUrl } from '../../../../../../../config/catalog.config';
import './CatalogQRGenerator.css';

interface CatalogQRGeneratorProps {
  companyName: string;
  isDark: boolean;
}

const CatalogQRGenerator: React.FC<CatalogQRGeneratorProps> = ({ companyName, isDark }) => {
  const [qrSize, setQrSize] = useState(256);
  const qrRef = useRef<HTMLDivElement>(null);

  // Generar URL del catálogo
  const catalogUrl = getCatalogUrl(companyName);

  // Función para descargar el QR como imagen
  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `catalogo-qr-${companyName}.png`;
      link.href = url;
      link.click();
    }
  };

  // Función para copiar la URL al portapapeles
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(catalogUrl);
      alert('URL copiada al portapapeles');
    } catch (err) {
      console.error('Error al copiar URL:', err);
    }
  };

  return (
    <div className={`catalog-qr-generator ${isDark ? 'dark' : ''}`}>
      <div className="qr-header">
        <h3 className="qr-title">Código QR del Catálogo</h3>
        <p className="qr-description">
          Comparte este código QR para que tus clientes puedan ver tu catálogo de productos
          sin necesidad de crear una cuenta.
        </p>
      </div>

      <div className="qr-content">
        <div className="qr-preview-section">
          <div className="qr-preview" ref={qrRef}>
            <QRCodeCanvas
              value={catalogUrl}
              size={qrSize}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: '/logo192.png',
                height: 32,
                width: 32,
                excavate: true,
              }}
            />
          </div>

          <div className="qr-size-control">
            <label htmlFor="qr-size">Tamaño: {qrSize}px</label>
            <input
              id="qr-size"
              type="range"
              min="128"
              max="512"
              step="32"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="qr-slider"
            />
          </div>
        </div>

        <div className="qr-info-section">
          <div className="qr-url-container">
            <label className="qr-url-label">URL del Catálogo:</label>
            <div className="qr-url-input-group">
              <input
                type="text"
                value={catalogUrl}
                readOnly
                className="qr-url-input"
              />
              <button
                onClick={copyUrl}
                className="qr-copy-btn"
                title="Copiar URL"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>

          <div className="qr-actions">
            <button onClick={downloadQR} className="qr-download-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="7 10 12 15 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Descargar QR
            </button>

            <button
              onClick={() => window.open(catalogUrl, '_blank')}
              className="qr-preview-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="15 3 21 3 21 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="10" y1="14" x2="21" y2="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Ver Catálogo
            </button>
          </div>

          <div className="qr-features">
            <h4 className="qr-features-title">Características del Catálogo:</h4>
            <ul className="qr-features-list">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Sin necesidad de cuenta o login
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Muestra todos tus productos activos
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Incluye tus preferencias de marca
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Solo visualización (sin compra)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogQRGenerator;
