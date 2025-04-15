import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import '../styles/enhanced-map.css';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px',
  overflow: 'hidden'
};

function GooglePhotoMap({ markers }) {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [map, setMap] = useState(null);
  
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

  return (
    <div className="map-container">
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={3}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            mapTypeControl: true,
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
    </div>
  );
}

export default GooglePhotoMap;