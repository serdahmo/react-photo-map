// src/components/ImagePreviewGrid.js
import React from 'react';
import '../styles/image-preview-grid.css';

const ImagePreviewGrid = ({ images, onRemove }) => {
  if (!images || images.length === 0) return null;
  
  return (
    <div className="image-preview-container">
      <h3>Selected Images</h3>
      <div className="image-preview-grid">
        {images.map((image, index) => (
          <div className="image-preview-item" key={index}>
            <img 
              src={URL.createObjectURL(image)} 
              alt={`Preview ${index + 1}`} 
            />
            <div className="image-name">{image.name}</div>
            {onRemove && (
              <button 
                className="remove-image-button" 
                onClick={() => onRemove(index)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagePreviewGrid;