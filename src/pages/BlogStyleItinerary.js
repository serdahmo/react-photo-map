// src/pages/BlogStyleItinerary.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import openAIService from '../utils/openAIUtils';
import '../styles/blog-itinerary.css';

function BlogStyleItinerary() {
  const [markers, setMarkers] = useState([]);
  const [travelStory, setTravelStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get markers from localStorage
  useEffect(() => {
    const savedMarkers = localStorage.getItem('photoMarkers');
    if (savedMarkers) {
      try {
        const parsedMarkers = JSON.parse(savedMarkers);
        // Sort markers by timestamp if available
        const sortedMarkers = [...parsedMarkers].sort((a, b) => {
          return (a.timestamp || 0) - (b.timestamp || 0);
        });
        setMarkers(sortedMarkers);
      } catch (err) {
        console.error('Error parsing markers from localStorage:', err);
        setError('Failed to load your saved photos');
      }
    }
  }, []);
  
  // Group markers by approximate location (within 1km) and date
  const groupByLocationAndDate = (markers) => {
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
        
        // Check if markers are within 1km and 24 hours of each other
        const timeDiff = Math.abs(
          (marker.timestamp || 0) - (prevMarker.timestamp || 0)
        );
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (distance < 1 && hoursDiff < 24) {
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
  
  const formatDate = (timestamp) => {
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
  
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    
    // Format: "3:45 PM"
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const generateTravelStory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Group markers by location and date
      const locationGroups = groupByLocationAndDate(markers);
      
      // Extract chronological story points
      const storyPoints = locationGroups.map(group => {
        // Use the first marker in each group as the representative
        const representative = group[0];
        return {
          latitude: representative.latitude,
          longitude: representative.longitude,
          timestamp: representative.timestamp,
          date: formatDate(representative.timestamp),
          time: formatTime(representative.timestamp),
          photos: group.map(marker => ({
            url: marker.imageUrl,
            name: marker.fileName || "Photo",
            timestamp: marker.timestamp
          }))
        };
      });
      
      // Get enhanced location information for each story point
      const enrichedStoryPoints = await Promise.all(
        storyPoints.map(async (point, index) => {
          try {
            // Generate additional context for the location
            const locationInfo = await openAIService.generateLocationFromImage(
              point.photos[0].url,
              point.latitude,
              point.longitude
            );
            
            return {
              ...point,
              locationInfo,
              dayNumber: index + 1
            };
          } catch (err) {
            console.error(`Error getting location info: ${err.message}`);
            return point;
          }
        })
      );
      
      // Generate the narrative travel story
      const generatedStory = await openAIService.generateTravelStory(enrichedStoryPoints);
      
      // Format the story for display
      const formattedStory = {
        title: generatedStory.title || "My Travel Adventure",
        subtitle: generatedStory.subtitle || "A photographic journey",
        introduction: generatedStory.introduction || "Join me as I share the highlights of my recent adventure, captured through my camera lens.",
        chapters: enrichedStoryPoints.map((point, index) => {
          const storyChapter = generatedStory.chapters?.[index] || {};
          
          return {
            id: index,
            dayNumber: point.dayNumber,
            title: storyChapter.title || `Day ${point.dayNumber}: ${point.locationInfo?.locationName || "A New Discovery"}`,
            date: point.date,
            location: {
              name: point.locationInfo?.locationName || "This Location",
              coordinates: [point.latitude, point.longitude],
              description: point.locationInfo?.description || "A fascinating place on my journey."
            },
            narrative: storyChapter.narrative || "Today was filled with new experiences and sights to remember.",
            highlights: storyChapter.highlights || ["The beautiful scenery", "Interesting local culture", "Memorable moments"],
            reflections: storyChapter.reflections || "Looking back, this place left a lasting impression on me.",
            photos: point.photos.map((photo, photoIndex) => ({
              url: photo.url,
              caption: storyChapter.photoCaptions?.[photoIndex] || "A moment captured during my travels",
              isFeatured: photoIndex === 0 // First photo is featured
            }))
          };
        }),
        conclusion: generatedStory.conclusion || "As this journey comes to an end, I take with me memories that will last a lifetime."
      };
      
      setTravelStory(formattedStory);
    } catch (err) {
      console.error('Error generating travel story:', err);
      setError('Failed to generate your travel story. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="blog-itinerary-page">
      <div className="page-header">
        <h1>Your Travel Story</h1>
        <p className="subtitle">Transform your photos into a narrative journey</p>
      </div>
      
      {markers.length === 0 ? (
        <div className="no-photos-message">
          <p>Upload photos in the Map section to create your travel story</p>
          <Link to="/map" className="upload-link">Upload Photos</Link>
        </div>
      ) : (
        <div className="story-generator">
          {!travelStory && (
            <>
              <p>Create a personal travel story based on your {markers.length} photos</p>
              <button 
                className="generate-button"
                onClick={generateTravelStory}
                disabled={loading}
              >
                {loading ? 'Creating Your Story...' : 'Create My Travel Story'}
              </button>
              
              {error && <p className="error-message">{error}</p>}
            </>
          )}
          
          {travelStory && (
            <div className="travel-story">
              <div className="story-header">
                <h1>{travelStory.title}</h1>
                <h2>{travelStory.subtitle}</h2>
              </div>
              
              <div className="story-intro">
                <p>{travelStory.introduction}</p>
              </div>
              
              <div className="story-chapters">
                {travelStory.chapters.map((chapter) => (
                  <div className="story-chapter" key={chapter.id}>
                    <div className="chapter-header">
                      <span className="chapter-day">Day {chapter.dayNumber}</span>
                      <h2>{chapter.title}</h2>
                      <div className="chapter-date">{chapter.date}</div>
                    </div>
                    
                    <div className="chapter-content">
                      <div className="featured-photo">
                        {chapter.photos.filter(photo => photo.isFeatured).map((photo, index) => (
                          <img key={index} src={photo.url} alt={`Day ${chapter.dayNumber} featured`} />
                        ))}
                        <div className="location-badge">
                          <span className="location-name">{chapter.location.name}</span>
                        </div>
                      </div>
                      
                      <div className="chapter-narrative">
                        <p>{chapter.narrative}</p>
                      </div>
                      
                      {chapter.highlights.length > 0 && (
                        <div className="chapter-highlights">
                          <h3>Highlights</h3>
                          <ul>
                            {chapter.highlights.map((highlight, index) => (
                              <li key={index}>{highlight}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="photo-gallery">
                        {chapter.photos.filter(photo => !photo.isFeatured).map((photo, index) => (
                          <div className="gallery-item" key={index}>
                            <img src={photo.url} alt={`Travel moment ${index + 1}`} />
                            <p className="photo-caption">{photo.caption}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="chapter-reflections">
                        <h3>Reflections</h3>
                        <p>{chapter.reflections}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="story-conclusion">
                <h2>Final Thoughts</h2>
                <p>{travelStory.conclusion}</p>
              </div>
              
              <div className="story-actions">
                <button className="share-button">Share Story</button>
                <button className="print-button">Print Story</button>
                <button className="edit-button">Edit Story</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlogStyleItinerary;