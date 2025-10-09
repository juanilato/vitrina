"use client";
import React, { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import "./ImageUploader.css"; // tu CSS existente

interface ImageUploaderProps {
  imageUrl?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => void;
  disabled?: boolean;
  label?: string;
  maxSizeMB?: number;
  /** Nueva prop: tipo de recorte */
  cropShape?: "circle" | "rect";
  /** Opcional: relación de aspecto (ej. 1 para cuadrado). Si no pasas nada y es circle, queda 1; si es rect y no pasas nada, es libre. */
  aspect?: number | undefined;
}

type Area = { width: number; height: number; x: number; y: number };

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageUrl,
  onUpload,
  onRemove,
  disabled = false,
  label = "Imagen",
  maxSizeMB = 5,
  cropShape = "rect",
  aspect
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | undefined>(imageUrl);
  const [localSrc, setLocalSrc] = useState<string | null>(null); // dataURL del archivo elegido
  const [showCropper, setShowCropper] = useState(false);

  // estados del cropper
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido.");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB`);
      return;
    }

    // Leemos como dataURL para mostrar en el recortador
    const reader = new FileReader();
    reader.onload = () => {
      setLocalSrc(reader.result as string);
      setShowCropper(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);

    // limpiamos el input para permitir volver a elegir el mismo archivo si se cancela
    e.currentTarget.value = "";
  };

  const triggerUpload = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirmCrop = async () => {
    if (!localSrc || !croppedAreaPixels) return;

    try {
      const blob = await getCroppedImageBlob(localSrc, croppedAreaPixels, cropShape);
      const fileName = cropShape === "circle" ? "crop.png" : inferFileNameFromDataURL(localSrc) ?? "crop.jpg";
      // Si es círculo exportamos PNG con transparencia
      const mime = cropShape === "circle" ? "image/png" : (blob.type || "image/jpeg");
      const file = new File([blob], fileName, { type: mime });

      // pre-visualización local
      const objectURL = URL.createObjectURL(blob);
      setPreviewUrl(objectURL);

      // subir al backend
      await onUpload(file);

      // cerrar modal
      setShowCropper(false);
      setLocalSrc(null);
    } catch (err) {
      console.error("❌ Error al recortar:", err);
      alert("Hubo un error al procesar el recorte.");
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setLocalSrc(null);
  };

  return (
    <div className="image-uploader">
      <h4>{label}</h4>

      <div className="image-preview" onClick={triggerUpload} role="button" aria-label="Subir imagen">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Imagen subida"
            style={cropShape === "circle" ? { borderRadius: "50%" } : undefined}
          />
        ) : (
          <div className="image-placeholder">
            <span className="icon">📷</span>
            <span>Haz clic para subir</span>
          </div>
        )}
        <div className="image-overlay">
          <span className="overlay-icon">📷</span>
          <span className="overlay-text">{previewUrl ? "Cambiar" : "Subir"}</span>
        </div>
      </div>

      <div className="image-actions">
        <button className="btn btn-primary" onClick={triggerUpload} disabled={disabled}>
          {previewUrl ? "Cambiar Imagen" : "Seleccionar Imagen"}
        </button>
        {previewUrl && onRemove && (
          <button
            className="btn btn-danger"
            onClick={() => {
              onRemove?.();
              setPreviewUrl(undefined);
            }}
            disabled={disabled}
          >
            Eliminar Imagen
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {showCropper && localSrc && (
        <div className="cropper-modal">
          <div className="cropper-dialog">
            <div className="cropper-header">
              <h5>Recortar {cropShape === "circle" ? "circular" : "rectangular"}</h5>
            </div>

            <div className="cropper-body">
              <div className="cropper-container">
                <Cropper
                  image={localSrc}
                  crop={crop}
                  zoom={zoom}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  cropShape={cropShape === "circle" ? "round" : "rect"}
                  // Si no pasas aspect y es circle, usamos 1 (cuadrado). Si es rect y no pasas aspect => libre (undefined).
                  aspect={typeof aspect === "number" ? aspect : (cropShape === "circle" ? 1 : undefined)}
                  showGrid={true}
                  restrictPosition={true}
                />
              </div>
              <div className="cropper-controls">
                <label htmlFor="zoom">Zoom</label>
                <input
                  id="zoom"
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="cropper-footer">
              <button className="btn btn-secondary" onClick={handleCancelCrop}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleConfirmCrop}>Usar recorte</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

/* =========================
   Helpers de recorte
========================= */

/** Devuelve el nombre base del archivo si el dataURL lo incluye (algunas fuentes), si no, null */
function inferFileNameFromDataURL(dataURL: string): string | null {
  try {
    const match = dataURL.match(/^data:(image\/[a-zA-Z0-9.+-]+);/);
    if (!match) return null;
    const mime = match[1]; // p.ej. image/jpeg
    const ext = mime.split("/")[1]?.split("+")[0] || "jpg";
    return `crop.${ext}`;
  } catch {
    return null;
  }
}

/**
 * Recorta usando canvas según el área en píxeles.
 * Para circle crea una máscara circular y exporta PNG con transparencia.
 */
async function getCroppedImageBlob(
  imageSrc: string,
  cropPixels: Area,
  shape: "circle" | "rect"
): Promise<Blob> {
  const img = await loadImage(imageSrc);

  // Ajustamos para HiDPI
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  // Si es círculo, hacemos el canvas cuadrado (lado = min(width,height)) para evitar estirar.
  const targetWidth = cropPixels.width;
  const targetHeight = cropPixels.height;

  // Para shape circle, queremos un PNG cuadrado (lado = min(targetWidth, targetHeight))
  const circleSide = Math.min(targetWidth, targetHeight);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round((shape === "circle" ? circleSide : targetWidth) * dpr);
  canvas.height = Math.round((shape === "circle" ? circleSide : targetHeight) * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto 2D del canvas.");

  ctx.scale(dpr, dpr);
  ctx.imageSmoothingQuality = "high";

  if (shape === "circle") {
    // fondo transparente + máscara circular
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const radius = circleSide / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Dibujar el área recortada centrada al nuevo lienzo cuadrado
    const offsetX = (circleSide - targetWidth) / 2;
    const offsetY = (circleSide - targetHeight) / 2;

    ctx.drawImage(
      img,
      cropPixels.x,           // sx
      cropPixels.y,           // sy
      cropPixels.width,       // sWidth
      cropPixels.height,      // sHeight
      offsetX,                // dx
      offsetY,                // dy
      targetWidth,            // dWidth
      targetHeight            // dHeight
    );
    ctx.restore();

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Falló la exportación PNG."))),
        "image/png",
        1
      );
    });
  }

  // Rectangular: mantenemos el tamaño del recorte
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    img,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  // Intentamos mantener el mime de origen si es posible
  const guessMime = guessImageMimeFromSrc(imageSrc) ?? "image/jpeg";

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falló la exportación del recorte."))),
      guessMime,
      0.95
    );
  });
}

function guessImageMimeFromSrc(src: string): string | null {
  if (src.startsWith("data:image/")) {
    const m = src.match(/^data:(image\/[a-zA-Z0-9.+-]+);/);
    return m ? m[1] : null;
    }
  // si es URL/objUrl no podemos saberlo con certeza; devolvemos null
  return null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Para dataURL no hace falta crossOrigin. Si viniera de otra fuente:
    // img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
