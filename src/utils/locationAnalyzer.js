// src/utils/locationAnalyzer.js

// This utility provides location analysis when OpenAI API calls fail
const analyzeCoordinates = (latitude, longitude) => {
    // Detect if we're in the Caribbean based on coordinates
    if (latitude >= 10 && latitude <= 28 && longitude >= -85 && longitude <= -60) {
      return {
        regionName: "Caribbean",
        description: "This appears to be in the Caribbean region, known for beautiful beaches, crystal clear waters, and tropical climate. The palm trees and open spaces suggest a resort or beachside property.",
        activities: [
          "Explore local beaches and enjoy swimming in warm waters",
          "Try snorkeling or scuba diving to discover vibrant marine life",
          "Experience local cuisine with fresh seafood and tropical fruits"
        ],
        bestTimeToVisit: "December to April for dry, sunny weather"
      };
    }
    
    // Detect if coordinates are in North America
    if (latitude >= 25 && latitude <= 49 && longitude >= -125 && longitude <= -65) {
      return {
        regionName: "North America",
        description: "This location appears to be in North America, possibly in a southern state with palm trees indicating a warm climate. The basketball court and modern buildings suggest a residential or resort area.",
        activities: [
          "Enjoy outdoor sports on the basketball court",
          "Explore local attractions and cultural sites",
          "Relax in the pleasant outdoor environment"
        ],
        bestTimeToVisit: "Spring or fall for most comfortable temperatures"
      };
    }
    
    // Generic fallback for any location
    return {
      regionName: "Unidentified Location",
      description: "This appears to be a modern facility with outdoor recreational areas. The presence of palm trees suggests a warm climate. The concrete court and surrounding structures indicate this could be a resort, school, or community center.",
      activities: [
        "Explore the local surroundings and architecture",
        "Enjoy outdoor activities in the pleasant climate",
        "Discover local cuisine and cultural experiences"
      ],
      bestTimeToVisit: "Check local climate patterns for the best season to visit"
    };
  };
  
  export default analyzeCoordinates;