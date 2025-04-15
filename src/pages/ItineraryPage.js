// src/pages/ItineraryPage.js
import React, { useState, useEffect } from 'react';
import openAIService from '../utils/openAIUtils';
import '../styles/itinerary.css';

function ItineraryPage() {
  const [markers, setMarkers] = useState([]);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get markers from localStorage
  useEffect(() => {
    const savedMarkers = localStorage.getItem('photoMarkers');
    if (savedMarkers) {
      try {
        const parsedMarkers = JSON.parse(savedMarkers);
        setMarkers(parsedMarkers);
      } catch (err) {
        console.error('Error parsing markers from localStorage:', err);
        setError('Failed to load your saved photos');
      }
    }
  }, []);
  
  // Group markers by approximate location (within 1km)
  const groupByLocation = (markers) => {
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
        
        if (distance < 1) { // 1km threshold
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
  
  const getDateString = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };
  
  const generateItinerary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Group markers by location
      const locationGroups = groupByLocation(markers);
      
      // Extract unique locations
      const uniqueLocations = locationGroups.map(group => {
        // Use the first marker in each group as the representative
        const representative = group[0];
        return {
          latitude: representative.latitude,
          longitude: representative.longitude,
          name: representative.fileName?.split('.')[0] || "Unknown",
          photoUrl: representative.imageUrl,
          timestamp: representative.timestamp,
          count: group.length
        };
      });
      
      // Get itinerary from OpenAI
      const generatedItinerary = await openAIService.generateItinerary(uniqueLocations);
      
      // Format the itinerary for display
      const formattedItinerary = {
        title: "Your Travel Journal",
        locations: uniqueLocations.map((location, index) => {
          // Find AI-generated content for this location
          const aiData = generatedItinerary.days?.[index] || null;
          
          return {
            id: index,
            name: aiData?.location || location.name,
            coordinates: [location.latitude, location.longitude],
            photoUrl: location.photoUrl,
            date: getDateString(location.timestamp),
            photoCount: location.count,
            description: aiData?.description || "A place you visited",
            historicalContext: aiData?.historicalContext || "",
            activities: aiData?.activities || [],
            diningRecommendations: aiData?.diningRecommendations || [],
            accommodationTips: aiData?.accommodationTips || "",
            transportationTips: aiData?.transportationTips || "",
            timeToSpend: aiData?.timeToSpend || "Unknown"
          };
        })
      };
      
      setItinerary(formattedItinerary);
    } catch (err) {
      console.error('Error generating itinerary:', err);
      setError('Failed to generate itinerary. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="itinerary-page">
      <h1>Your Travel Journal</h1>
      
      {markers.length === 0 ? (
        <div className="no-photos-message">
          <p>Upload photos in the Map section to generate your travel journal</p>
        </div>
      ) : (
        <div className="itinerary-generator">
          <p>Create a detailed travel journal based on your {markers.length} photos</p>
          <button 
            className="generate-button"
            onClick={generateItinerary}
            disabled={loading}
          >
            {loading ? 'Generating Journal...' : 'Generate Travel Journal'}
          </button>
          
          {error && <p className="error-message">{error}</p>}
          
          {itinerary && (
            <div className="itinerary-results">
              <h2>{itinerary.title}</h2>
              
              {itinerary.locations.map((location) => (
                <div className="journal-entry" key={location.id}>
                  <div className="entry-header">
                    <h3>{location.name}</h3>
                    <p className="entry-date">{location.date}</p>
                  </div>
                  
                  <div className="entry-content">
                    <div className="entry-photo">
                      <img src={location.photoUrl} alt={location.name} />
                      <p className="photo-count">
                        {location.photoCount} {location.photoCount === 1 ? 'photo' : 'photos'} from this location
                      </p>
                    </div>
                    
                    <div className="entry-details">
                      <p className="coordinates">
                        Coordinates: {location.coordinates[0].toFixed(4)}, {location.coordinates[1].toFixed(4)}
                      </p>
                      
                      <div className="description">
                        <h4>About This Place</h4>
                        <p>{location.description}</p>
                      </div>
                      
                      {location.historicalContext && (
                        <div className="historical-context">
                          <h4>Historical Context</h4>
                          <p>{location.historicalContext}</p>
                        </div>
                      )}
                      
                      {location.activities.length > 0 && (
                        <div className="activities">
                          <h4>Activities</h4>
                          <ul className="detailed-list">
                            {location.activities.map((activity, idx) => (
                              <li key={idx}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {location.diningRecommendations && location.diningRecommendations.length > 0 && (
                        <div className="dining">
                          <h4>Where to Eat</h4>
                          <ul>
                            {location.diningRecommendations.map((place, idx) => (
                              <li key={idx}>{place}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {location.accommodationTips && (
                        <div className="accommodation">
                          <h4>Where to Stay</h4>
                          <p>{location.accommodationTips}</p>
                        </div>
                      )}
                      
                      {location.transportationTips && (
                        <div className="transportation">
                          <h4>Getting Around</h4>
                          <p>{location.transportationTips}</p>
                        </div>
                      )}
                      
                      <p className="time-spent">
                        <strong>Recommended time to spend:</strong> {location.timeToSpend}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="itinerary-actions">
                <button className="save-button">Save Journal</button>
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