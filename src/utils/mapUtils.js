// src/utils/mapUtils.js
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };
  
  export const fitBoundsToMarkers = (map, markers, googleMaps) => {
    if (!map || markers.length === 0) return;
    
    const bounds = new googleMaps.LatLngBounds();
    markers.forEach(marker => {
      bounds.extend({
        lat: marker.latitude,
        lng: marker.longitude
      });
    });
    
    map.fitBounds(bounds);
  };
  
  export const groupMarkersByLocation = (markers, proximityThreshold = 1) => {
    const groups = [];
    let currentGroup = [];
    
    // Sort markers by timestamp if available
    const sortedMarkers = [...markers].sort((a, b) => {
      return (a.timestamp || 0) - (b.timestamp || 0);
    });
    
    sortedMarkers.forEach((marker, index) => {
      if (index === 0) {
        currentGroup.push(marker);
      } else {
        const prevMarker = sortedMarkers[index - 1];
        const distance = calculateDistance(
          prevMarker.latitude, prevMarker.longitude,
          marker.latitude, marker.longitude
        );
        
        if (distance < proximityThreshold) {
          currentGroup.push(marker);
        } else {
          groups.push([...currentGroup]);
          currentGroup = [marker];
        }
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  };
  
  export const formatDate = (timestamp) => {
    if (!timestamp) return "An unknown date";
    const date = new Date(timestamp);
    
    // Format: "Monday, June 12, 2023"
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };