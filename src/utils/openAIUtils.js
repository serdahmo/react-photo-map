// src/utils/openAIUtils.js

// Get API key from environment variable
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

class OpenAIService {
  constructor(apiKey = OPENAI_API_KEY) {
    this.apiKey = apiKey;
  }

  async generateText(prompt, systemPrompt = "You are a helpful travel assistant that provides detailed information about locations and creates comprehensive itineraries.", temperature = 0.7) {
    try {
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

  async generateLocationInfo(latitude, longitude) {
    try {
      const prompt = `I have a photo taken at coordinates: ${latitude}, ${longitude}. 
      Please provide extensive, detailed information about this location in JSON format with these fields:
      {
        "locationName": "City, Country",
        "description": "Detailed description of the area (at least 150 words)",
        "history": "Historical information about this location (at least 100 words)",
        "pointsOfInterest": ["Place 1 with description", "Place 2 with description", "Place 3 with description"],
        "bestTimeToVisit": "Season or time with explanation",
        "culturalTips": "Detailed cultural information and local customs",
        "foodAndDrink": "Local culinary specialties and where to find them"
      }`;
      
      const result = await this.generateText(prompt, 
        "You are a travel expert who provides extremely detailed, comprehensive information about locations. Include historical context, cultural significance, and vivid descriptions. Always respond in valid JSON format only.");
      
      return JSON.parse(result);
    } catch (error) {
      console.error("Failed to get location info:", error);
      return {
        locationName: "Unknown Location",
        description: "Information not available",
        history: "Historical information not available",
        pointsOfInterest: [],
        bestTimeToVisit: "Any time",
        culturalTips: "",
        foodAndDrink: ""
      };
    }
  }

  async generateItinerary(locations) {
    try {
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
      return { 
        days: locations.map((loc, index) => ({
          day: index + 1,
          location: "Location information unavailable",
          description: "Could not retrieve location information",
          historicalContext: "",
          activities: [],
          diningRecommendations: [],
          accommodationTips: "",
          transportationTips: "",
          timeToSpend: "Unknown"
        }))
      };
    }
  }

  async generateRecommendations(locations) {
    try {
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
      return {
        placesToVisit: ["Error retrieving recommendations"],
        thingsToDo: ["Please check your API key or try again later"],
        travelTips: [],
        localCuisine: [],
        culturalInsights: [],
        bestTimeToVisit: "",
        budgetConsiderations: ""
      };
    }
  }
}

// Create and export a singleton instance
const openAIService = new OpenAIService();
export default openAIService;