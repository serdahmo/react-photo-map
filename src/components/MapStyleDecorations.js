// src/components/MapStyleDecorations.js
import React from 'react';
import '../styles/map-decorations.css';

const MapStyleDecorations = ({ locationName, description }) => {
  // Function to get map color scheme based on location
  const getMapColorScheme = (locationName, description) => {
    const text = (locationName + ' ' + description).toLowerCase();
    
    if (text.includes('beach') || text.includes('coast') || text.includes('ocean') || 
        text.includes('sea') || text.includes('tropical') || text.includes('island')) {
      return 'coastal';
    } else if (text.includes('mountain') || text.includes('forest') || text.includes('national park') ||
               text.includes('hiking') || text.includes('trail')) {
      return 'nature';
    } else if (text.includes('desert') || text.includes('canyon') || text.includes('dry')) {
      return 'desert';
    } else if (text.includes('snow') || text.includes('winter') || text.includes('cold') ||
               text.includes('ice') || text.includes('ski')) {
      return 'winter';
    } else if (text.includes('historic') || text.includes('ancient') || text.includes('ruins') ||
               text.includes('museum') || text.includes('castle')) {
      return 'historic';
    } else {
      return 'urban'; // Default
    }
  };

  const mapColorScheme = getMapColorScheme(locationName || '', description || '');
  
  // Generate random pin positions
  const generatePins = (count) => {
    const pins = [];
    for (let i = 0; i < count; i++) {
      const top = 10 + Math.random() * 80; // Between 10% and 90%
      const left = 10 + Math.random() * 80; // Between 10% and 90%
      pins.push({ top, left });
    }
    return pins;
  };
  
  const pins = generatePins(5); // Generate 5 pins

  return (
    <div className={`map-decoration-container ${mapColorScheme}-map`}>
      <div className="map-background"></div>
      
      {/* Map Grid Lines */}
      <div className="map-grid">
        <div className="grid-line horizontal line-1"></div>
        <div className="grid-line horizontal line-2"></div>
        <div className="grid-line horizontal line-3"></div>
        <div className="grid-line vertical line-1"></div>
        <div className="grid-line vertical line-2"></div>
        <div className="grid-line vertical line-3"></div>
      </div>
      
      {/* Main Focus Pin */}
      <div className="map-pin main-pin">
        <div className="pin-head"></div>
        <div className="pin-shadow"></div>
      </div>
      
      {/* Random Location Pins */}
      {pins.map((pin, index) => (
        <div 
          key={index}
          className="map-pin secondary-pin"
          style={{ top: `${pin.top}%`, left: `${pin.left}%` }}
        >
          <div className="pin-head small"></div>
        </div>
      ))}
      
      {/* Compass Rose */}
      <div className="compass-rose">
        <div className="compass-n">N</div>
        <div className="compass-e">E</div>
        <div className="compass-s">S</div>
        <div className="compass-w">W</div>
        <div className="compass-circle"></div>
      </div>
      
      {/* Location Name */}
      <div className="location-label">
        {locationName || 'Destination'}
      </div>
    </div>
  );
};

export default MapStyleDecorations;