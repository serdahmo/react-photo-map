// src/pages/RecommendationsPage.js
import React, { useState, useEffect } from 'react';
import openAIService from '../utils/openAIUtils';
import '../styles/recommendations.css';

function RecommendationsPage() {
  const [markers, setMarkers] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get markers from localStorage
  useEffect(() => {
    const savedMarkers = localStorage.getItem('photoMarkers');
    if (savedMarkers) {
      try {
        setMarkers(JSON.parse(savedMarkers));
      } catch (err) {
        console.error('Error parsing markers from localStorage:', err);
      }
    }
  }, []);
  
  const getRecommendations = async () => {
    if (markers.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create a list of unique locations
      const uniqueLocations = markers.reduce((acc, marker) => {
        // Check if this location is already in our list (approximate match)
        const isDuplicate = acc.some(loc => 
          calculateDistance(loc.latitude, loc.longitude, marker.latitude, marker.longitude) < 1
        );
        
        if (!isDuplicate) {
          acc.push({
            latitude: marker.latitude,
            longitude: marker.longitude,
            name: marker.fileName?.split('.')[0] || "Unknown"
          });
        }
        
        return acc;
      }, []);
      
      // Get recommendations from OpenAI
      const aiRecommendations = await openAIService.generateRecommendations(uniqueLocations);
      setRecommendations(aiRecommendations);
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError('Failed to get recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
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
  
  return (
    <div className="recommendations-page">
      <h1>Travel Recommendations</h1>
      
      {markers.length === 0 ? (
        <div className="no-photos-message">
          <p>Upload photos in the Map section to get recommendations based on your travels</p>
        </div>
      ) : (
        <div className="recommendations-generator">
          <p>Get personalized travel recommendations based on your {markers.length} photos</p>
          <button
            className="generate-button"
            onClick={getRecommendations}
            disabled={loading}
          >
            {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
          </button>
          
          {error && <p className="error-message">{error}</p>}
          
          {recommendations && (
            <div className="recommendations-results">
              <h2>Your Travel Recommendations</h2>
              
              <div className="recommendation-section">
                <h3>Places to Visit</h3>
                <ul className="detailed-list">
                  {recommendations.placesToVisit?.map((place, index) => (
                    <li key={index}>{place}</li>
                  ))}
                </ul>
              </div>
              
              <div className="recommendation-section">
                <h3>Things to Do</h3>
                <ul className="detailed-list">
                  {recommendations.thingsToDo?.map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))}
                </ul>
              </div>
              
              <div className="recommendation-section">
                <h3>Travel Tips</h3>
                <ul className="detailed-list">
                  {recommendations.travelTips?.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
              
              <div className="recommendation-section">
                <h3>Local Cuisine to Try</h3>
                <ul className="detailed-list">
                  {recommendations.localCuisine?.map((food, index) => (
                    <li key={index}>{food}</li>
                  ))}
                </ul>
              </div>
              
              {recommendations.culturalInsights && (
                <div className="recommendation-section">
                  <h3>Cultural Insights</h3>
                  <ul className="detailed-list">
                    {recommendations.culturalInsights?.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {recommendations.bestTimeToVisit && (
                <div className="recommendation-section">
                  <h3>Best Time to Visit</h3>
                  <p className="detailed-text">{recommendations.bestTimeToVisit}</p>
                </div>
              )}
              
              {recommendations.budgetConsiderations && (
                <div className="recommendation-section">
                  <h3>Budget Considerations</h3>
                  <p className="detailed-text">{recommendations.budgetConsiderations}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RecommendationsPage;