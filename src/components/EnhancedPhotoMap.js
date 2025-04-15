// src/components/EnhancedPhotoMap.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import '../styles/enhanced-map.css';

// Custom component to handle map bounds
function SetBoundsComponent({ markers }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers.length > 1) {
      const latLngs = markers.map(marker => [marker.latitude, marker.longitude]);
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds);
    }
  }, [markers, map]);
  
  return null;
}

// Custom component to add photo markers
function PhotoMarkers({ markers }) {
  const map = useMap();
  
  useEffect(() => {
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
    
    // Add new photo markers
    markers.forEach((marker) => {
      const photoIcon = L.divIcon({
        className: 'photo-marker',
        html: `<div class="marker-container"><img src="${marker.imageUrl}" alt="${marker.fileName}" /></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      
      const photoMarker = L.marker([marker.latitude, marker.longitude], { icon: photoIcon })
        .addTo(map);
        
      photoMarker.bindPopup(`
        <div class="photo-popup">
          <h3>${marker.fileName}</h3>
          <img src="${marker.imageUrl}" alt="${marker.fileName}" />
          <p>Latitude: ${marker.latitude.toFixed(4)}</p>
          <p>Longitude: ${marker.longitude.toFixed(4)}</p>
        </div>
      `);
    });
  }, [markers, map]);
  
  return null;
}

function EnhancedPhotoMap({ markers }) {
  const defaultCenter = markers.length
    ? [markers[0].latitude, markers[0].longitude]
    : [20, 0]; // World center
    
  const [selectedBaseMap, setSelectedBaseMap] = useState('streets');
  
  const baseMaps = {
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
    }
  };

  return (
    <div className="enhanced-map-container">
      <div className="map-controls">
        <div className="base-map-selector">
          <label>Map Style:</label>
          <select 
            value={selectedBaseMap} 
            onChange={(e) => setSelectedBaseMap(e.target.value)}
          >
            <option value="streets">Streets</option>
            <option value="satellite">Satellite</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>
      </div>
      
      <MapContainer
        center={defaultCenter}
        zoom={3}
        style={{ height: '600px', width: '100%' }}
        className="photo-map"
      >
        <TileLayer
          url={baseMaps[selectedBaseMap].url}
          attribution={baseMaps[selectedBaseMap].attribution}
        />
        <SetBoundsComponent markers={markers} />
        <PhotoMarkers markers={markers} />
      </MapContainer>
      
      {markers.length > 0 && (
        <div className="photo-strip">
          {markers.map((marker, index) => (
            <div className="photo-thumbnail" key={index}>
              <img src={marker.imageUrl} alt={marker.fileName} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EnhancedPhotoMap;