// src/pages/MapPage.js
import React, { useState, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import GooglePhotoMap from '../components/GooglePhotoMap';
import PhotoManager from '../components/PhotoManager';
import '../styles/map.css';

function MapPage() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // Load markers from localStorage on component mount
    const savedMarkers = localStorage.getItem('photoMarkers');
    if (savedMarkers) {
      try {
        setMarkers(JSON.parse(savedMarkers));
      } catch (err) {
        console.error('Error parsing markers from localStorage:', err);
      }
    }
  }, []);

  const handleImagesLoaded = (newMarkers) => {
    setMarkers(newMarkers);
  };

  const handleClearMarkers = () => {
    setMarkers([]);
  };

  const handleRemoveMarker = (updatedMarkers) => {
    setMarkers(updatedMarkers);
  };

  return (
    <div className="map-page">
      <h1>My Photo Journey</h1>
      <p className="subtitle">Upload photos with location data to see them on the map</p>
      
      <ImageUploader onImagesLoaded={handleImagesLoaded} />
      
      <PhotoManager 
        markers={markers} 
        onClearMarkers={handleClearMarkers}
        onRemoveMarker={handleRemoveMarker}
      />
      
      {markers.length > 0 ? (
        <div className="map-container-wrapper">
          <div className="map-info">
            <h2>Your Travel Map</h2>
            <p>{markers.length} photo{markers.length !== 1 ? 's' : ''} on your map</p>
          </div>
          <GooglePhotoMap markers={markers} />
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