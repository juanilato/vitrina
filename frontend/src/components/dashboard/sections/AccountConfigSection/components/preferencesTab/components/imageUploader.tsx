"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import "./ImageUploader.css";
import PhotoIcon from '@mui/icons-material/Photo';
import { createPortal } from "react-dom";
import { useEffect } from "react";
type CropShape = "circle" | "rect";

export interface ImageUploaderProProps {
  label?: string;
  description?: string;
  imageUrl?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => void;
  disabled?: boolean;
  cropShape?: CropShape;           // "circle" | "rect"
  aspect?: number | undefined;     // ej. 1, 16/9, etc
  width?: number;                  // ancho del preview (px)
  height?: number;                 // alto del preview (px) (para rect)
}

type Area = { width: number; height: number; x: number; y: number };

const ImageUploader: React.FC<ImageUploaderProProps> = ({
  label = "Imagen",
  description,
  imageUrl,
  onUpload,
  onRemove,
  disabled = false,
  cropShape = "rect",
  aspect,
  width = 320,
  height = 180,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | undefined>(imageUrl);
  const [localSrc, setLocalSrc] = useState<string | null>(null);
  const [openCrop, setOpenCrop] = useState(false);

  // cropper state
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPx, setAreaPx] = useState<Area | null>(null);

  const computedAspect = useMemo(() => {
    if (typeof aspect === "number") return aspect;
    return cropShape === "circle" ? 1 : undefined; // círculo por defecto cuadrado
  }, [aspect, cropShape]);

  useEffect(() => {
  if (openCrop) {
    document.body.classList.add("no-scroll");
  } else {
    document.body.classList.remove("no-scroll");
  }
  return () => document.body.classList.remove("no-scroll");
}, [openCrop]);

  // Tamaños del preview por modo
  const boxStyle = useMemo(() => {
    if (cropShape === "circle") {
      const side = width; // usamos width como diámetro
      return { width: side, height: side, borderRadius: "50%" } as React.CSSProperties;
    }
    return { width, height, borderRadius: 12 } as React.CSSProperties;
  }, [cropShape, width, height]);

  const pickFile = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const onCropComplete = useCallback((_a: Area, aPx: Area) => setAreaPx(aPx), []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      alert("Seleccioná un archivo de imagen válido.");
      e.currentTarget.value = "";
      return;
    }
    if (f.size > 7 * 1024 * 1024) {
      alert("El archivo es muy grande (máximo 7MB).");
      e.currentTarget.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLocalSrc(reader.result as string);
      setOpenCrop(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(f);
    e.currentTarget.value = "";
  };

  const confirmCrop = async () => {
    if (!localSrc || !areaPx) {
      console.error('❌ Missing localSrc or areaPx:', { localSrc, areaPx });
      return;
    }
    try {
      console.log('🔄 Starting crop process...', { cropShape, areaPx });
      const blob = await getCroppedBlob(localSrc, areaPx, cropShape);
      console.log('✅ Blob created:', { size: blob.size, type: blob.type });

      const ext = cropShape === "circle" ? "png" : "jpg";
      const file = new File([blob], `upload.${ext}`, { type: blob.type });
      console.log('📁 File created:', { name: file.name, size: file.size });

      const objUrl = URL.createObjectURL(blob);
      setPreviewUrl(objUrl);

      console.log('📤 Uploading file...');
      await onUpload(file);
      console.log('✅ Upload successful!');

      setOpenCrop(false);
      setLocalSrc(null);
    } catch (e) {
      console.error('❌ Error in confirmCrop:', e);
      alert("No se pudo procesar el recorte: " + (e instanceof Error ? e.message : 'Error desconocido'));
    }
  };

  const cancelCrop = () => {
    setOpenCrop(false);
    setLocalSrc(null);
  };

  return (
    <div className="iu-card">
      <div className="iu-head">
        <div className="iu-titles">
          <h4 className="iu-title">{label}</h4>
          {description && <p className="iu-desc">{description}</p>}
        </div>
        <div className="iu-actions">
          <button
            type="button"
            className="btn-quiet"
            onClick={pickFile}
            disabled={disabled}
          >
            {previewUrl ? "Cambiar" : "Subir imagen"}
          </button>
          {previewUrl && onRemove && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                onRemove?.();
                setPreviewUrl(undefined);
              }}
              disabled={disabled}
              title="Quitar imagen"
            >
              Quitar
            </button>
          )}
        </div>
      </div>

      <div className="iu-body">
        <div
          className={`iu-preview ${!previewUrl ? "is-empty" : ""}`}
          style={boxStyle}
          onClick={pickFile}
          role="button"
          aria-label="Elegir imagen"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              style={cropShape === "circle" ? { borderRadius: "50%" } : undefined}
            />
          ) : (
            <div className="iu-empty">
              <span className="iu-empty-icon"><PhotoIcon /></span>
      
            </div>
          )}
        </div>
      </div>

      {/* input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {/* modal recorte minimal */}

{openCrop && localSrc &&
  createPortal(
    <div className="iu-modal" role="dialog" aria-modal="true">
      <div className="iu-dialog">
        <div className="iu-dialog-head">
          <h5>Recortar</h5>
          <button className="btn-icon" onClick={cancelCrop} aria-label="Cerrar">✕</button>
        </div>

        <div className="iu-crop-area">
          <Cropper
            image={localSrc}
            crop={crop}
            zoom={zoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape={cropShape === "circle" ? "round" : "rect"}
            aspect={computedAspect}
            showGrid={false}
            restrictPosition
          />
        </div>

        <div className="iu-dialog-foot">
          <div className="iu-zoom">
            <span>Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </div>
          <div className="iu-foot-actions">
            <button className="btn-ghost" onClick={cancelCrop}>Cancelar</button>
            <button className="btn-quiet" onClick={confirmCrop}>Usar recorte</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

    </div>
  );
};

export default ImageUploader;

/* ===== Helpers ===== */
async function getCroppedBlob(src: string, area: Area, shape: CropShape): Promise<Blob> {
  try {
    console.log('🖼️ Loading image...', { src: src.substring(0, 50) });
    const img = await loadImage(src);
    console.log('✅ Image loaded:', { width: img.width, height: img.height });

    const dpr = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
    console.log('📐 DPR:', dpr);

    const targetW = area.width;
    const targetH = area.height;
    console.log('🎯 Target dimensions:', { targetW, targetH, area });

    const canvas = document.createElement("canvas");
    if (shape === "circle") {
      const side = Math.min(targetW, targetH);
      canvas.width = Math.round(side * dpr);
      canvas.height = Math.round(side * dpr);
      console.log('⭕ Circle crop - Canvas size:', { width: canvas.width, height: canvas.height });
    } else {
      canvas.width = Math.round(targetW * dpr);
      canvas.height = Math.round(targetH * dpr);
      console.log('▭ Rect crop - Canvas size:', { width: canvas.width, height: canvas.height });
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo obtener contexto del canvas");

    ctx.scale(dpr, dpr);
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (shape === "circle") {
      const side = Math.min(targetW, targetH);
      const r = side / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(r, r, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const offsetX = (side - targetW) / 2;
      const offsetY = (side - targetH) / 2;

      ctx.drawImage(img, area.x, area.y, area.width, area.height, offsetX, offsetY, targetW, targetH);
      ctx.restore();

      console.log('🎨 Drawing circle image to canvas...');
      return new Promise((res, rej) => {
        canvas.toBlob((b) => {
          if (b) {
            console.log('✅ Circle blob created:', b.size, 'bytes');
            res(b);
          } else {
            console.error('❌ Failed to create circle blob');
            rej(new Error("No se pudo exportar la imagen circular"));
          }
        }, "image/png", 1);
      });
    }

    console.log('🎨 Drawing rect image to canvas...');
    ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, targetW, targetH);
    const mime = guessMime(src) || "image/jpeg";
    console.log('📝 MIME type:', mime);

    return new Promise((res, rej) => {
      canvas.toBlob((b) => {
        if (b) {
          console.log('✅ Rect blob created:', b.size, 'bytes');
          res(b);
        } else {
          console.error('❌ Failed to create rect blob');
          rej(new Error("No se pudo exportar la imagen"));
        }
      }, mime, 0.95);
    });
  } catch (error) {
    console.error('❌ Error in getCroppedBlob:', error);
    throw error;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => {
      console.log('✅ Image loaded successfully');
      resolve(i);
    };
    i.onerror = (e) => {
      console.error('❌ Failed to load image:', e);
      reject(new Error('No se pudo cargar la imagen'));
    };
    i.src = src;
  });
}
function guessMime(src: string): string | null {
  if (src.startsWith("data:image/")) {
    const m = src.match(/^data:(image\/[a-zA-Z0-9.+-]+);/);
    return m ? m[1] : null;
  }
  return null;
}
