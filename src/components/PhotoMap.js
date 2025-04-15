import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function PhotoMap({ markers }) {
  // Set the initial center of the map. We use the first marker or default coordinates.
  const defaultCenter = markers.length
    ? [markers[0].latitude, markers[0].longitude]
    : [51.505, -0.09];
  
  // Calculate bounds to fit all markers
  const [bounds, setBounds] = useState(null);
  
  useEffect(() => {
    if (markers.length > 1) {
      // Create bounds from all marker positions
      const latLngs = markers.map(marker => [marker.latitude, marker.longitude]);
      setBounds(latLngs);
    }
  }, [markers]);

  return (
    <div className="map-container">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        style={{ height: '500px', width: '100%' }}
        bounds={bounds}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker, index) => (
          <Marker position={[marker.latitude, marker.longitude]} key={index}>
            <Popup>
              <div className="photo-popup">
                <strong>{marker.fileName}</strong>
                <p>{`Lat: ${marker.latitude.toFixed(4)}, Lon: ${marker.longitude.toFixed(4)}`}</p>
                {marker.imageUrl && (
                  <img 
                    src={marker.imageUrl} 
                    alt={marker.fileName} 
                    style={{ maxWidth: '200px', maxHeight: '200px' }} 
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default PhotoMap;