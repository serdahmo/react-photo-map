// src/pages/MapPage.js
import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import EnhancedPhotoMap from '../components/EnhancedPhotoMap';
import '../styles/map.css';

function MapPage() {
  const [markers, setMarkers] = useState([]);

  return (
    <div className="map-page">
      <h1>My Photo Journey</h1>
      <p className="subtitle">Upload photos with location data to see them on the map</p>
      
      <ImageUploader onImagesLoaded={setMarkers} />
      
      {markers.length > 0 ? (
        <div className="map-container">
          <div className="map-info">
            <h2>Your Travel Map</h2>
            <p>{markers.length} photo{markers.length !== 1 ? 's' : ''} on your map</p>
          </div>
          <EnhancedPhotoMap markers={markers} />
        </div>
      ) : (
        <div className="empty-map">
          <div className="empty-map-message">
            <h3>Your map is waiting for memories</h3>
            <p>Upload photos with location data to start creating your journey map</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapPage;