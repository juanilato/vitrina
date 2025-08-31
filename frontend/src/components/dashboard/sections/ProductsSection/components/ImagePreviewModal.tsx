import React from 'react';
import { ImagePreviewModalProps } from '../types';

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  show,
  imageUrl,
  fileName,
  isNewImage = false,
  onClose
}) => {
  if (!show || !imageUrl) return null;

  return (
    <div className={`image-preview-modal ${show ? 'show' : ''}`}>
      <div className="image-preview-header">
        <h3>Vista Previa</h3>
        <button 
          className="image-preview-close" 
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className="image-preview-content">
        <img 
          src={imageUrl} 
          alt="Preview del producto" 
          className="image-preview-img"
        />
      </div>
    </div>
  );
};

export default ImagePreviewModal;
