import React, { useRef, useEffect, useState } from 'react';
import '../styles/enhanced-map.css';

function SimpleGoogleMap({ markers }) {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  
  // First, load the Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Check if script is already loaded
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }
      
      // If script is already being loaded, don't add it again
      if (document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
        return;
      }
      
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = () => console.error("Failed to load Google Maps script");
      
      document.head.appendChild(script);
    };
    
    loadGoogleMapsScript();
  }, []);
  
  // Initialize the map once script is loaded and the ref exists
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    // Create the map
    const newMap = new window.google.maps.Map(mapRef.current, {
      center: markers.length > 0 
        ? { lat: markers[0].latitude, lng: markers[0].longitude } 
        : { lat: 20, lng: 0 },
      zoom: 10,
      mapTypeControl: true,
      fullscreenControl: true
    });
    
    setMap(newMap);
  }, [mapLoaded, markers]);
  
  // Add markers after map is initialized
  useEffect(() => {
    if (!map || !markers.length) return;
    
    // Clear existing markers
    const existingMarkers = [];
    map.addListener = map.addListener || function() {};
    map.overlayMapTypes = map.overlayMapTypes || { clear: function() {} };
    map.overlayMapTypes.clear();
    
    for (const marker of existingMarkers) {
      if (marker.setMap) {
        marker.setMap(null);
      }
    }
    
    // Add new markers and create bounds
    const bounds = new window.google.maps.LatLngBounds();
    const infoWindows = [];
    
    markers.forEach((markerData, index) => {
      const position = { 
        lat: markerData.latitude, 
        lng: markerData.longitude 
      };
      
      // Extend bounds
      bounds.extend(position);
      
      // Create marker
      const marker = new window.google.maps.Marker({
        position: position,
        map: map,
        title: markerData.fileName || `Photo ${index + 1}`
      });
      
      // Create info window content
      const infoContent = document.createElement('div');
      infoContent.className = 'photo-popup';
      infoContent.innerHTML = `
        <h3>${markerData.fileName || "Photo"}</h3>
        <img 
          src="${markerData.imageUrl}" 
          alt="${markerData.fileName || "Location photo"}" 
          style="max-width: 200px; max-height: 200px; border-radius: 4px;" 
        />
        <p>
          Lat: ${markerData.latitude.toFixed(4)}, 
          Lon: ${markerData.longitude.toFixed(4)}
        </p>
      `;
      
      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent
      });
      
      infoWindows.push(infoWindow);
      
      // Add click listener to marker
      marker.addListener('click', () => {
        // Close all open info windows
        infoWindows.forEach(window => window.close());
        
        // Open this info window
        infoWindow.open(map, marker);
      });
      
      existingMarkers.push(marker);
    });
    
    // Fit map to bounds if multiple markers
    if (markers.length > 1) {
      map.fitBounds(bounds);
    }
    
    // Clean up when component unmounts
    return () => {
      existingMarkers.forEach(marker => {
        if (marker.setMap) {
          marker.setMap(null);
        }
      });
    };
  }, [map, markers]);
  
  return (
    <div className="map-container">
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '600px', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa'
        }}
      >
        {!mapLoaded && <div>Loading Google Maps...</div>}
      </div>
    </div>
  );
}

export default SimpleGoogleMap;