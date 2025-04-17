// src/utils/openAIUtils.js
import analyzeCoordinates from './locationAnalyzer';

// Get API key from environment variable
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

class OpenAIService {
  constructor(apiKey = OPENAI_API_KEY) {
    this.apiKey = apiKey;
  }

  async generateText(prompt, systemPrompt = "You are a helpful travel assistant that provides detailed information about locations and creates comprehensive itineraries.", temperature = 0.7) {
    try {
      // Validate API key
      if (!this.apiKey || this.apiKey === "your-api-key-here" || this.apiKey.trim() === "") {
        console.warn("OpenAI API key is missing or invalid");
        throw new Error("API key missing or invalid");
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: temperature,
          max_tokens: 2000 // Increased for longer responses
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error("OpenAI API Error:", data.error);
        throw new Error(data.error.message || "Error calling OpenAI API");
      }
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error generating text:", error);
      throw error;
    }
  }

  async generateLocationFromImage(imageUrl, latitude, longitude) {
    try {
      // Use local analysis if API key issues
      if (!this.apiKey || this.apiKey === "your-api-key-here" || this.apiKey.trim() === "") {
        return this.generateFallbackLocationInfo(latitude, longitude);
      }
      
      const prompt = `I have a photo taken at coordinates: ${latitude}, ${longitude}. 
      If these coordinates don't clearly identify a specific named location, please analyze the general region and:
      
      1. Provide a description of what the region is likely to be (coastal area, mountains, urban environment, etc.)
      2. Suggest what this place might be based on its geographic position
      3. Describe activities and points of interest that would typically be found in this type of location or region
      
      Respond with VALID JSON in this exact format:
      {
        "locationName": "Best guess at location name or descriptive label (e.g., 'Coastal Town in Southern Italy' or 'Mountain Region in the Alps')",
        "description": "Detailed description based on the coordinates and regional characteristics (at least 150 words)",
        "vibeDescription": "Description of the atmosphere/vibe of this type of place",
        "pointsOfInterest": ["Nearby attraction 1 with description", "Nearby attraction 2 with description", "Nearby attraction 3 with description"],
        "recommendedActivities": ["Activity 1 appropriate for this region", "Activity 2", "Activity 3"],
        "localSpecialties": ["Food/cultural item 1 typical of this region", "Food/cultural item 2", "Food/cultural item 3"]
      }`;
      
      const systemPrompt = "You are a travel expert with extensive knowledge of global geography. When given coordinates, identify the location as specifically as possible, or if precise identification isn't possible, provide rich, descriptive information about the general region and what travelers might expect there. Always respond with valid JSON only.";
      
      const result = await this.generateText(prompt, systemPrompt, 0.8);
      return JSON.parse(result);
    } catch (error) {
      console.error("Failed to analyze location:", error);
      return this.generateFallbackLocationInfo(latitude, longitude);
    }
  }

  generateFallbackLocationInfo(latitude, longitude) {
    // Use our local analyzer to get location info
    const analysis = analyzeCoordinates(latitude, longitude);
    
    return {
      locationName: analysis.regionName,
      description: analysis.description,
      vibeDescription: "A pleasant locale with its own unique atmosphere and character worth exploring.",
      pointsOfInterest: [
        "Local attractions within a short distance",
        "Natural features characteristic of this region",
        "Cultural landmarks that showcase local history"
      ],
      recommendedActivities: analysis.activities,
      localSpecialties: [
        "Regional cuisine specialties",
        "Local crafts and artisanal products",
        "Cultural traditions unique to this area"
      ]
    };
  }

  async generateItinerary(locations) {
    try {
      // Validate API key
      if (!this.apiKey || this.apiKey === "your-api-key-here" || this.apiKey.trim() === "") {
        return this.generateFallbackItinerary(locations);
      }
      
      // Format the locations for the prompt
      const locationsList = locations.map(loc => 
        `- Location: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
      ).join("\n");
      
      const prompt = `Based on these locations from my photos:
      ${locationsList}
      
      Create a detailed travel itinerary with comprehensive information about each location. 
      Provide historical context, cultural significance, and insider tips.
      
      Respond with VALID JSON in this exact format:
      {
        "days": [
          {
            "day": 1,
            "location": "Location name with area and country",
            "description": "Detailed description of the location (at least 200 words)",
            "historicalContext": "Historical information about this place (at least 100 words)",
            "activities": ["Activity 1 with detailed description", "Activity 2 with detailed description", "Activity 3 with detailed description"],
            "diningRecommendations": ["Restaurant 1 with specialty", "Restaurant 2 with specialty"],
            "accommodationTips": "Where to stay with options for different budgets",
            "transportationTips": "How to get around in this area",
            "timeToSpend": "Recommended time to spend with explanation"
          }
        ]
      }`;
      
      const systemPrompt = "You are a travel itinerary expert with extensive knowledge of global destinations. Provide extraordinarily detailed, vivid, and comprehensive travel plans. Always respond with valid JSON only, no explanations or additional text.";
      
      const result = await this.generateText(prompt, systemPrompt, 0.8);
      return JSON.parse(result);
    } catch (error) {
      console.error("Failed to generate itinerary:", error);
      return this.generateFallbackItinerary(locations);
    }
  }
  
  generateFallbackItinerary(locations) {
    return { 
      days: locations.map((loc, index) => {
        const analysis = analyzeCoordinates(loc.latitude, loc.longitude);
        return {
          day: index + 1,
          location: analysis.regionName,
          description: analysis.description,
          historicalContext: "This region has a rich and diverse history that has shaped its current culture and attractions.",
          activities: analysis.activities,
          diningRecommendations: [
            "Local specialty restaurants showcasing regional cuisine",
            "Casual dining options for authentic local flavors"
          ],
          accommodationTips: "Options range from luxury resorts to budget-friendly accommodations depending on your preferences.",
          transportationTips: "Consider renting a vehicle to explore the area or use local transportation options if available.",
          timeToSpend: analysis.bestTimeToVisit
        };
      })
    };
  }

  async generateRecommendations(locations) {
    try {
      // Validate API key
      if (!this.apiKey || this.apiKey === "your-api-key-here" || this.apiKey.trim() === "") {
        return this.generateFallbackRecommendations(locations);
      }
      
      // Format the locations for the prompt
      const locationsList = locations.map(loc => 
        `- Location: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
      ).join("\n");
      
      const prompt = `Based on these locations from my photos:
      ${locationsList}
      
      Provide comprehensive travel recommendations with detailed explanations in VALID JSON format like this:
      {
        "placesToVisit": ["Place 1 with detailed description (50+ words)", "Place 2 with detailed description", "Place 3 with detailed description"],
        "thingsToDo": ["Activity 1 with detailed explanation (50+ words)", "Activity 2 with detailed explanation", "Activity 3 with detailed explanation"],
        "travelTips": ["Tip 1 with detailed explanation (50+ words)", "Tip 2 with detailed explanation", "Tip 3 with detailed explanation"],
        "localCuisine": ["Food 1 with history and where to try it (50+ words)", "Food 2 with history and where to try it", "Food 3 with history and where to try it"],
        "culturalInsights": ["Cultural insight 1 with detailed explanation (50+ words)", "Cultural insight 2 with detailed explanation", "Cultural insight 3 with detailed explanation"],
        "bestTimeToVisit": "Comprehensive explanation of when to visit with seasonal variations",
        "budgetConsiderations": "Detailed breakdown of budget considerations for the region"
      }`;
      
      const systemPrompt = "You are a travel recommendation expert with in-depth knowledge of global destinations. Provide extremely detailed, vivid, and comprehensive travel advice. Always respond with valid JSON only, no additional text.";
      
      const result = await this.generateText(prompt, systemPrompt, 0.8);
      return JSON.parse(result);
    } catch (error) {
      console.error("Failed to generate recommendations:", error);
      return this.generateFallbackRecommendations(locations);
    }
  }
  
  generateFallbackRecommendations(locations) {
    // Use the first location for region analysis
    const firstLocation = locations[0];
    const analysis = analyzeCoordinates(firstLocation.latitude, firstLocation.longitude);
    
    return {
      placesToVisit: [
        "Consider exploring major attractions in this region which typically include natural wonders, historical sites, and cultural landmarks.",
        "Look for local parks, beaches, or recreational areas that showcase the natural beauty of this region.",
        "Seek out museums or historical sites that tell the story of the local culture and heritage."
      ],
      thingsToDo: analysis.activities,
      travelTips: [
        "Research local customs and etiquette before your visit to ensure respectful interactions.",
        "Pack appropriate clothing for the local climate and any specific activities you plan to enjoy.",
        "Consider learning a few phrases in the local language to enhance your interaction with residents."
      ],
      localCuisine: [
        "Try regional specialties featuring local ingredients and traditional cooking methods.",
        "Visit local markets to sample fresh produce and authentic prepared foods.",
        "Consider booking a food tour to get an expert introduction to the local culinary scene."
      ],
      culturalInsights: [
        "This region likely has unique cultural traditions that reflect its history and environment.",
        "Look for opportunities to experience local arts, music, or festivals during your visit.",
        "Engage with local communities respectfully to gain authentic insights into daily life."
      ],
      bestTimeToVisit: analysis.bestTimeToVisit,
      budgetConsiderations: "Costs can vary widely based on accommodation choices, dining preferences, and activities. Research current prices for your specific destination and travel style."
    };
  }

  // Add this method to the OpenAIService class in src/utils/openAIUtils.js

async generateTravelStory(storyPoints) {
    try {
      // Validate API key
      if (!this.apiKey || this.apiKey === "your-api-key-here" || this.apiKey.trim() === "") {
        return this.generateFallbackTravelStory(storyPoints);
      }
      
      // Format location points for the prompt
      const locationDetails = storyPoints.map((point, index) => {
        const date = point.date || `Day ${index + 1}`;
        const location = point.locationInfo?.locationName || "Unknown location";
        const photoCount = point.photos?.length || 0;
        
        return `
          - Location ${index + 1}: ${location}
          - Date: ${date}
          - Coordinates: ${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}
          - Number of photos: ${photoCount}
          - Description: ${point.locationInfo?.description || "No description available"}
        `;
      }).join("\n");
      
      const prompt = `Create a personal travel blog/journal based on these locations from my trip:
      
      ${locationDetails}
      
      I want a narrative first-person story that feels like a personal travel blog with emotional reflections and storytelling elements. Imagine you're me writing about my journey through these places.
      
      Respond with VALID JSON in this exact format:
      {
        "title": "An engaging, creative title for my travel story",
        "subtitle": "A brief, evocative subtitle",
        "introduction": "A personal introduction paragraph about the overall journey (150-200 words)",
        "chapters": [
          {
            "title": "Creative title for this location/day",
            "narrative": "First-person narrative about this day/location (300-400 words). Include vivid descriptions, personal feelings, and memorable moments. Make it feel like a personal journal entry with emotional depth.",
            "highlights": ["Highlight 1 with thoughtful commentary", "Highlight 2 with thoughtful commentary", "Highlight 3 with thoughtful commentary"],
            "reflections": "Personal reflection paragraph looking back on this part of the journey (100-150 words)",
            "photoCaptions": ["Evocative caption for photo 1", "Evocative caption for photo 2"]
          }
        ],
        "conclusion": "Thoughtful closing paragraph about the journey as a whole (150-200 words)"
      }`;
      
      const systemPrompt = "You are a talented travel writer who creates engaging, personal travel stories in a blog/journal style. You write vivid first-person narratives with emotional depth, insightful reflections, and storytelling elements. Your writing sounds authentic and personal, like someone sharing their travel experiences with friends.";
      
      const result = await this.generateText(prompt, systemPrompt, 0.7);
      return JSON.parse(result);
    } catch (error) {
      console.error("Failed to generate travel story:", error);
      return this.generateFallbackTravelStory(storyPoints);
    }
  }
  
  generateFallbackTravelStory(storyPoints) {
    // Basic fallback story when API generation fails
    return {
      title: "My Photographic Journey",
      subtitle: "Capturing Moments and Memories",
      introduction: "This journey began as a simple adventure but transformed into something much more meaningful. Through the lens of my camera, I captured not just places, but moments and emotions that tell the story of this incredible experience.",
      chapters: storyPoints.map((point, index) => {
        const locationName = point.locationInfo?.locationName || "This fascinating place";
        
        return {
          title: `Day ${index + 1}: Exploring ${locationName}`,
          narrative: `Today's adventure took me to ${locationName}, where each moment offered something new to discover. The journey itself was as memorable as the destination, with scenic views and unexpected encounters along the way. Once I arrived, I was immediately struck by the unique character of this place - something that photos can capture but never fully convey. I spent time wandering through the area, camera in hand, trying to preserve these experiences through my lens. Some moments were planned, while others were beautiful surprises that happened when I least expected them.`,
          highlights: [
            "The incredible scenery that surrounded me throughout the day",
            "Interactions with locals that gave me insight into the authentic culture",
            "Quiet moments of reflection that made this journey special"
          ],
          reflections: "Looking back on this day, I'm grateful for both the planned experiences and the unexpected moments. There's something powerful about exploring new places and preserving those memories through photography.",
          photoCaptions: point.photos?.map((_, photoIndex) => 
            `A captured moment from my journey through ${locationName}`
          ) || []
        };
      }),
      conclusion: "As this journey comes to a close, I find myself looking through these photos with a sense of gratitude. Each image represents more than just a place - it captures a feeling, a moment, a memory that now becomes part of my story. While the journey itself has ended, these memories and experiences have become a part of who I am, and I carry them forward into whatever adventure comes next."
    };
  }
}

// Create and export a singleton instance
const openAIService = new OpenAIService();
export default openAIService;