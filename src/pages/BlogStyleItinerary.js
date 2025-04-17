// src/pages/BlogStyleItinerary.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import openAIService from '../utils/openAIUtils';
import MapStyleDecorations from '../components/MapStyleDecorations';
import '../styles/blog-itinerary.css';
import '../styles/map-decorations.css';

function BlogStyleItinerary() {
  const [markers, setMarkers] = useState([]);
  const [travelStory, setTravelStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  
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
  
  const generateTravelStory = async () => {
    setLoading(true);
    setError(null);
    setProcessingProgress(0);
    
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
          photos: group.map(marker => ({
            url: marker.imageUrl,
            name: marker.fileName || "Photo",
            timestamp: marker.timestamp
          }))
        };
      });
      
      // Process story points in sequence with progress tracking
      const totalPoints = storyPoints.length;
      const enrichedStoryPoints = [];
      
      for (let i = 0; i < storyPoints.length; i++) {
        const point = storyPoints[i];
        try {
          // Update progress
          setProcessingProgress(Math.floor((i / totalPoints) * 100));
          
          // Generate additional context for the location
          // Add a delay between API calls to avoid rate limiting
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          const locationInfo = await openAIService.generateLocationFromImage(
            point.photos[0].url,
            point.latitude,
            point.longitude,
            point.photos[0].name || "" // Pass the filename for better context
          );
          
          enrichedStoryPoints.push({
            ...point,
            locationInfo,
            dayNumber: i + 1
          });
        } catch (err) {
          console.error(`Error getting location info for point ${i}:`, err);
          // Still add the point with whatever info we have
          enrichedStoryPoints.push({
            ...point,
            locationInfo: {
              locationName: `Location ${i + 1}`,
              description: "A place visited during my journey.",
              vibeDescription: "A place with its own unique character and atmosphere.",
              pointsOfInterest: [],
              recommendedActivities: [],
              localSpecialties: []
            },
            dayNumber: i + 1
          });
        }
      }
      
      // Update progress to show we're generating the final story
      setProcessingProgress(90);
      
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
      setProcessingProgress(100);
    } catch (err) {
      console.error('Error generating travel story:', err);
      setError('Failed to generate your travel story. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleShareToInstagram = (chapter) => {
    setSelectedChapter(chapter);
    setShowInstagramModal(true);
  };
  
  const handleCopyCaption = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Caption copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };
  
  const InstagramContentModal = ({ chapter, onClose }) => {
    if (!chapter) return null;
    
    const featuredPhoto = chapter.photos.find(photo => photo.isFeatured);
    const captionHashtags = "#travel #photography #travelstory #wanderlust #adventure";
    const captionText = `Day ${chapter.dayNumber} of my journey: ${chapter.title}
    
${chapter.narrative.split('.')[0]}. ${chapter.narrative.split('.')[1] || ''}

${captionHashtags}`;
    
    return (
      <div className="instagram-modal-overlay" onClick={onClose}>
        <div className="instagram-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Instagram Content</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          
          <div className="instagram-preview">
            <h3>Post Preview</h3>
            <div className="instagram-post-preview">
              <img src={featuredPhoto?.url} alt="Featured location" />
              <div className="instagram-overlay">
                <div className="instagram-location">{chapter.location.name}</div>
                <div className="instagram-caption-preview">"{featuredPhoto?.caption}"</div>
              </div>
            </div>
          </div>
          
          <div className="instagram-caption">
            <h3>Suggested Caption</h3>
            <textarea
              readOnly
              value={captionText}
            />
            <button 
              className="copy-caption-button"
              onClick={() => handleCopyCaption(captionText)}
            >
              Copy Caption
            </button>
          </div>
          
          <div className="instagram-instructions">
            <h3>How to Post</h3>
            <ol>
              <li>Save the image to your device</li>
              <li>Open Instagram and create a new post</li>
              <li>Select the saved image</li>
              <li>Paste the caption</li>
              <li>Tag the location as: {chapter.location.name}</li>
              <li>Share and enjoy!</li>
            </ol>
          </div>
          
          <div className="modal-actions">
            <a 
              href={featuredPhoto?.url} 
              download={`travel-day-${chapter.dayNumber}.jpg`}
              className="download-image-button"
            >
              Download Image
            </a>
            <button className="cancel-button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
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
              
              {loading && (
                <div className="processing-status">
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill" 
                      style={{width: `${processingProgress}%`}}
                    ></div>
                  </div>
                  <p>Processing photos: {processingProgress}% complete</p>
                </div>
              )}
              
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
                      {/* Map style decorations */}
                      <div className="decoration-wrapper">
                        <MapStyleDecorations 
                          locationName={chapter.location.name} 
                          description={chapter.location.description}
                        />
                      </div>
                      
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
                      
                      {chapter.photos.filter(photo => !photo.isFeatured).length > 0 && (
                        <div className="photo-gallery">
                          {chapter.photos.filter(photo => !photo.isFeatured).map((photo, index) => (
                            <div className="gallery-item" key={index}>
                              <img src={photo.url} alt={`Travel moment ${index + 1}`} />
                              <p className="photo-caption">{photo.caption}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="chapter-reflections">
                        <h3>Reflections</h3>
                        <p>{chapter.reflections}</p>
                      </div>
                      
                      <div className="chapter-actions">
                        <button 
                          className="create-instagram-button"
                          onClick={() => handleShareToInstagram(chapter)}
                        >
                          Create Instagram Post
                        </button>
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
                <button className="print-button" onClick={() => window.print()}>Print Story</button>
                <button className="edit-button">Edit Story</button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {showInstagramModal && (
        <InstagramContentModal 
          chapter={selectedChapter}
          onClose={() => setShowInstagramModal(false)}
        />
      )}
    </div>
  );
}

export default BlogStyleItinerary;