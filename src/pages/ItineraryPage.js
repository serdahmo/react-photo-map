// src/pages/ItineraryPage.js
import React, { useState, useEffect } from 'react';
import '../styles/itinerary.css';

function ItineraryPage() {
  const [markers, setMarkers] = useState([]);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Get markers from localStorage (we'll add this feature)
  useEffect(() => {
    const savedMarkers = localStorage.getItem('photoMarkers');
    if (savedMarkers) {
      setMarkers(JSON.parse(savedMarkers));
    }
  }, []);
  
  const generateItinerary = () => {
    setLoading(true);
    
    // Sort the markers by timestamp if available, or just organize by location
    const sortedMarkers = [...markers].sort((a, b) => {
      // For now, simple sorting by latitude
      return a.latitude - b.latitude;
    });
    
    // Group markers by location proximity
    const locationGroups = groupByLocation(sortedMarkers);
    
    // Create daily itineraries
    const days = createDailyItineraries(locationGroups);
    
    setItinerary({
      title: "Your Travel Itinerary",
      days: days
    });
    
    setLoading(false);
  };
  
  // Helper function to group markers by location proximity
  const groupByLocation = (markers) => {
    // Simple implementation - in reality this would use clustering algorithms
    const groups = [];
    let currentGroup = [];
    
    markers.forEach((marker, index) => {
      if (index === 0) {
        currentGroup.push(marker);
      } else {
        const prevMarker = markers[index - 1];
        const distance = calculateDistance(
          prevMarker.latitude, prevMarker.longitude,
          marker.latitude, marker.longitude
        );
        
        if (distance < 10) { // 10km threshold - adjust as needed
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
  
  // Calculate distance between two coordinates in km (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c;
    return d;
  };
  
  // Create daily itineraries from location groups
  const createDailyItineraries = (locationGroups) => {
    return locationGroups.map((group, dayIndex) => {
      return {
        day: dayIndex + 1,
        locations: group.map(marker => ({
          name: marker.fileName.split('.')[0], // Use filename without extension
          coordinates: [marker.latitude, marker.longitude],
          photoUrl: marker.imageUrl
        }))
      };
    });
  };
  
  return (
    <div className="itinerary-page">
      <h1>Travel Itinerary</h1>
      
      {markers.length === 0 ? (
        <div className="no-photos-message">
          <p>Upload photos in the Map section to generate an itinerary</p>
        </div>
      ) : (
        <div className="itinerary-generator">
          <p>Generate a travel itinerary based on your {markers.length} photos</p>
          <button 
            className="generate-button"
            onClick={generateItinerary}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Itinerary'}
          </button>
          
          {itinerary && (
            <div className="itinerary-results">
              <h2>{itinerary.title}</h2>
              
              {itinerary.days.map((day) => (
                <div className="itinerary-day" key={day.day}>
                  <h3>Day {day.day}</h3>
                  <div className="day-locations">
                    {day.locations.map((location, index) => (
                      <div className="location-card" key={index}>
                        <div className="location-photo">
                          <img src={location.photoUrl} alt={location.name} />
                        </div>
                        <div className="location-info">
                          <h4>{location.name}</h4>
                          <p>Coordinates: {location.coordinates[0].toFixed(4)}, {location.coordinates[1].toFixed(4)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="itinerary-actions">
                <button className="save-button">Save Itinerary</button>
                <button className="print-button">Print</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ItineraryPage;