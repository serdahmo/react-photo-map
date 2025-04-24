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
        <h3>Your Photo Collection</h3>
        <div className="manager-stats">
          <span className="stat-item">
            <span className="stat-icon">📷</span>
            <span className="stat-value">{markers.length}</span>
            <span className="stat-label">Photos</span>
          </span>
          <button 
            className="clear-all-button" 
            onClick={handleClearAll}
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="photo-grid">
        {markers.map((marker, index) => (
          <div className="photo-card" key={index}>
            <div className="photo-image">
              <img 
                src={marker.imageUrl} 
                alt={marker.fileName || `Photo ${index + 1}`} 
              />
              <button 
                className="remove-photo-button" 
                onClick={() => handleRemovePhoto(index)}
                title="Remove photo"
              >
                ×
              </button>
            </div>
            <div className="photo-details">
              <h4 className="photo-name">{marker.fileName || `Photo ${index + 1}`}</h4>
              <div className="photo-metadata">
                <div className="metadata-item location">
                  <span className="metadata-icon">📍</span>
                  <span className="metadata-value">
                    {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
                  </span>
                </div>
                {marker.dateTime && (
                  <div className="metadata-item date">
                    <span className="metadata-icon">📅</span>
                    <span className="metadata-value">
                      {marker.dateTime}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PhotoManager;