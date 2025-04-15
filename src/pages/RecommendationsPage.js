// src/pages/RecommendationsPage.js
import React, { useState, useEffect } from 'react';
import '../styles/recommendations.css';

function RecommendationsPage() {
  const [markers, setMarkers] = useState([]);
  const [aiKey, setAiKey] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [keyVerified, setKeyVerified] = useState(false);
  
  // Get markers from localStorage
  useEffect(() => {
    const savedMarkers = localStorage.getItem('photoMarkers');
    const savedKey = localStorage.getItem('openAiKey');
    
    if (savedMarkers) {
      setMarkers(JSON.parse(savedMarkers));
    }
    
    if (savedKey) {
      setAiKey(savedKey);
      setKeyVerified(true);
    }
  }, []);
  
  const saveApiKey = () => {
    localStorage.setItem('openAiKey', aiKey);
    setKeyVerified(true);
  };
  
  const getRecommendations = async () => {
    if (!aiKey) return;
    
    setLoading(true);
    
    try {
      // Extract locations from markers
      const locations = markers.map(marker => {
        // Attempt to reverse geocode or just use coordinates
        return {
          coordinates: [marker.latitude, marker.longitude],
          name: marker.fileName.split('.')[0] // Use filename as location name for now
        };
      });
      
      // Create a prompt for OpenAI
      const prompt = `Based on these travel locations: ${locations.map(loc => loc.name).join(', ')}, 
      please provide travel recommendations for similar places to visit, things to do, 
      and travel tips for this region. Format the recommendations as JSON with categories: 
      "placesToVisit", "thingsToDo", "travelTips", and "localCuisine".`;
      
      // Make API request to OpenAI
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-instruct", // Update this with the latest model
          prompt: prompt,
          max_tokens: 500,
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      
      // Parse the response
      const responseText = data.choices[0].text;
      const parsedRecommendations = JSON.parse(responseText);
      
      setRecommendations(parsedRecommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Failed to get recommendations. Check your API key and try again.');
    }
    
    setLoading(false);
  };
  
  return (
    <div className="recommendations-page">
      <h1>Travel Recommendations</h1>
      
      {!keyVerified ? (
        <div className="api-key-section">
          <p>Enter your OpenAI API key to get personalized travel recommendations</p>
          <div className="api-key-input">
            <input
              type="password"
              placeholder="OpenAI API Key"
              value={aiKey}
              onChange={(e) => setAiKey(e.target.value)}
            />
            <button onClick={saveApiKey}>Save Key</button>
          </div>
          <p className="key-note">Your API key is stored locally in your browser and never sent to our servers.</p>
        </div>
      ) : (
        <>
          {markers.length === 0 ? (
            <div className="no-photos-message">
              <p>Upload photos in the Map section to get recommendations based on your travels</p>
            </div>
          ) : (
            <div className="recommendations-generator">
              <p>Get travel recommendations based on your {markers.length} photos</p>
              <button
                className="generate-button"
                onClick={getRecommendations}
                disabled={loading}
              >
                {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
              </button>
              
              {recommendations && (
                <div className="recommendations-results">
                  <h2>Your Travel Recommendations</h2>
                  
                  <div className="recommendation-section">
                    <h3>Places to Visit</h3>
                    <ul>
                      {recommendations.placesToVisit.map((place, index) => (
                        <li key={index}>{place}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="recommendation-section">
                    <h3>Things to Do</h3>
                    <ul>
                      {recommendations.thingsToDo.map((activity, index) => (
                        <li key={index}>{activity}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="recommendation-section">
                    <h3>Travel Tips</h3>
                    <ul>
                      {recommendations.travelTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="recommendation-section">
                    <h3>Local Cuisine to Try</h3>
                    <ul>
                      {recommendations.localCuisine.map((food, index) => (
                        <li key={index}>{food}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RecommendationsPage;