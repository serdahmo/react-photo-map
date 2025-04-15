// src/components/PhotoManager.js
import React from 'react';
import '../styles/photo-manager.css';

function PhotoManager({ markers, onClearMarkers, onRemoveMarker }) {
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all photos? This action cannot be undone.')) {
      localStorage.removeItem('photoMarkers');
      onClearMarkers();
    }
  };

  const handleRemovePhoto = (index) => {
    const updatedMarkers = markers.filter((_, i) => i !== index);
    localStorage.setItem('photoMarkers', JSON.stringify(updatedMarkers));
    onRemoveMarker(updatedMarkers);
  };

  if (markers.length === 0) {
    return null;
  }

  return (
    <div className="photo-manager">
      <div className="manager-header">
        <h3>Manage Photos</h3>
        <button 
          className="clear-all-button" 
          onClick={handleClearAll}
        >
          Clear All Photos
        </button>
      </div>
      
      <div className="photo-grid">
        {markers.map((marker, index) => (
          <div className="photo-item" key={index}>
            <div className="photo-thumbnail">
              <img 
                src={marker.imageUrl} 
                alt={marker.fileName || `Photo ${index + 1}`} 
              />
            </div>
            <div className="photo-info">
              <p className="photo-name">{marker.fileName || `Photo ${index + 1}`}</p>
              <p className="photo-coords">
                {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
              </p>
            </div>
            <button 
              className="remove-photo-button" 
              onClick={() => handleRemovePhoto(index)}
              title="Remove photo"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PhotoManager;