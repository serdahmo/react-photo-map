import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function PhotoMap({ markers }) {
  // Set the initial center of the map. We use the first marker or default coordinates.
  const defaultCenter = markers.length
    ? [markers[0].latitude, markers[0].longitude]
    : [51.505, -0.09];

  return (
    <MapContainer center={defaultCenter} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker, index) => (
        <Marker position={[marker.latitude, marker.longitude]} key={index}>
          <Popup>
            <strong>{marker.fileName}</strong>
            <br />
            {`Lat: ${marker.latitude.toFixed(4)}, Lon: ${marker.longitude.toFixed(4)}`}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default PhotoMap;
