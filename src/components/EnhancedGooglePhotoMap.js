import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import '../styles/enhanced-map.css';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px',
  overflow: 'hidden'
};

const mapTypes = {
  roadmap: 'Road Map',
  satellite: 'Satellite',
  hybrid: 'Hybrid',
  terrain: 'Terrain'
};

function EnhancedGooglePhotoMap({ markers }) {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [map, setMap] = useState(null);
  const [mapType, setMapType] = useState('roadmap');
  
  // Default center if no markers are provided
  const defaultCenter = {
    lat: 20, 
    lng: 0
  };

  // Get center from first marker or use default
  const center = markers.length > 0 
    ? { lat: markers[0].latitude, lng: markers[0].longitude } 
    : defaultCenter;

  // Function to fit map bounds to all markers
  const fitBounds = useCallback(() => {
    if (map && markers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach(marker => {
        bounds.extend({
          lat: marker.latitude,
          lng: marker.longitude
        });
      });
      map.fitBounds(bounds);
    }
  }, [map, markers]);

  // When markers change, fit bounds
  useEffect(() => {
    if (map && markers.length > 0) {
      fitBounds();
    }
  }, [map, markers, fitBounds]);

  // Map load handler
  const onLoad = useCallback(map => {
    setMap(map);
  }, []);

  // Map unmount handler
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Marker click handler
  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };
  
  // Thumbnail click handler
  const handleThumbnailClick = (marker) => {
    setSelectedMarker(marker);
    if (map) {
      map.panTo({ lat: marker.latitude, lng: marker.longitude });
      map.setZoom(15);
    }
  };
  
  // Map type change handler
  const handleMapTypeChange = (e) => {
    setMapType(e.target.value);
  };

  return (
    <div className="enhanced-map-container">
      <div className="map-controls">
        <div className="map-type-selector">
          <label htmlFor="map-type">Map Type:</label>
          <select 
            id="map-type" 
            value={mapType} 
            onChange={handleMapTypeChange}
          >
            {Object.entries(mapTypes).map(([type, label]) => (
              <option key={type} value={type}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={3}
          onLoad={onLoad}
          onUnmount={onUnmount}
          mapTypeId={mapType}
          options={{
            mapTypeControl: false, // We're handling this ourselves
            streetViewControl: true,
            fullscreenControl: true
          }}
        >
          {/* Create a marker for each photo location */}
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={{
                lat: marker.latitude,
                lng: marker.longitude
              }}
              onClick={() => handleMarkerClick(marker)}
              animation={window.google.maps.Animation.DROP}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new window.google.maps.Size(40, 40)
              }}
            />
          ))}

          {/* Show info window when a marker is selected */}
          {selectedMarker && (
            <InfoWindow
              position={{
                lat: selectedMarker.latitude,
                lng: selectedMarker.longitude
              }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="photo-popup">
                <h3>{selectedMarker.fileName || "Photo"}</h3>
                <img 
                  src={selectedMarker.imageUrl} 
                  alt={selectedMarker.fileName || "Location photo"} 
                  style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }} 
                />
                <p>
                  Lat: {selectedMarker.latitude.toFixed(4)}, 
                  Lon: {selectedMarker.longitude.toFixed(4)}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
      
      {/* Photo strip at the bottom */}
      {markers.length > 0 && (
        <div className="photo-strip">
          {markers.map((marker, index) => (
            <div 
              key={index} 
              className={`photo-thumbnail ${selectedMarker === marker ? 'active' : ''}`}
              onClick={() => handleThumbnailClick(marker)}
            >
              <img src={marker.imageUrl} alt={marker.fileName || `Photo ${index + 1}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EnhancedGooglePhotoMap;