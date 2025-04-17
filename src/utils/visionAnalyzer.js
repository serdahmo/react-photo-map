// src/utils/visionAnalyzer.js
import axios from 'axios';

// Track API usage to avoid hitting rate limits
const apiUsageTracker = {
  lastCallTime: 0,
  callCount: 0,
  resetTime: 0,
  
  // Check if we should make another API call or wait
  canMakeCall: function() {
    const now = Date.now();
    
    // Reset counter if more than a minute has passed since last reset
    if (now - this.resetTime > 60000) {
      this.callCount = 0;
      this.resetTime = now;
    }
    
    // Limit to 3 calls per minute to avoid rate limiting
    if (this.callCount >= 3) {
      console.log("Rate limit reached, waiting for reset");
      return false;
    }
    
    // Ensure at least 500ms between calls
    if (now - this.lastCallTime < 500) {
      console.log("Throttling API calls");
      return false;
    }
    
    return true;
  },
  
  // Record a successful API call
  recordCall: function() {
    this.lastCallTime = Date.now();
    this.callCount++;
    if (this.resetTime === 0) {
      this.resetTime = this.lastCallTime;
    }
  }
};

// This function analyzes the image using OpenAI's Vision API
async function analyzeImageWithVision(imageUrl) {
  // Check if we're hitting rate limits
  if (!apiUsageTracker.canMakeCall()) {
    throw new Error("API rate limit reached, using fallback for this image");
  }
  
  try {
    // Get API key from environment variable or local storage
    const apiKey = localStorage.getItem('openAiKey') || process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === "your-api-key-here" || apiKey.trim() === "") {
      throw new Error("API key missing or invalid");
    }
    
    // Convert image URL to base64 if it's a local file URL
    // For uploaded photos, we need to convert the blob URL to base64
    let imageContent;
    if (imageUrl.startsWith('blob:')) {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      imageContent = await blobToBase64(blob);
    } else {
      imageContent = imageUrl;
    }
    
    // First, try a more efficient API call just to analyze the image content
    const analysisResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4-vision-preview", // Use the appropriate vision model
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this travel photo in detail. What does this image show? Where might this be? What's happening in this scene? Be specific and detailed about what you can observe."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageContent
                }
              }
            ]
          }
        ],
        max_tokens: 500 // Reduced tokens for efficiency
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    // Record successful API call
    apiUsageTracker.recordCall();
    
    // Extract the description from the API response
    const imageDescription = analysisResponse.data.choices[0].message.content;
    
    // Now generate a structured story segment based on this description
    // Use a text-only API call which is less expensive and more reliable
    const storyResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4-turbo", // Use standard text model
        messages: [
          {
            role: "system",
            content: "You are a talented travel writer creating a personal travel blog story based on a scene description. Write in first person, with emotional depth and vivid details."
          },
          {
            role: "user",
            content: `Based on this description of a travel photo: "${imageDescription}", create a personal travel story segment in JSON format with the following structure:
            {
              "locationName": "Specific name of the place shown in the image",
              "narrative": "A first-person, emotionally rich description of experiencing this place (300-400 words)",
              "highlights": ["Three specific memorable moments or features from the image"],
              "reflections": "A thoughtful paragraph about how this place affected me (100 words)",
              "photoCaptions": ["An evocative caption for this photo"]
            }`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    // Record the second API call
    apiUsageTracker.recordCall();
    
    // Parse the JSON response
    const storyText = storyResponse.data.choices[0].message.content;
    let storyObject;
    
    try {
      // Try to parse the JSON response
      storyObject = JSON.parse(storyText);
    } catch (jsonError) {
      console.error("Error parsing JSON from story generation:", jsonError);
      
      // Extract JSON from non-JSON response if necessary
      const jsonMatch = storyText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          storyObject = JSON.parse(jsonMatch[0]);
        } catch (secondJsonError) {
          throw new Error("Failed to parse JSON from story response");
        }
      } else {
        throw new Error("No valid JSON found in response");
      }
    }
    
    return storyObject;
  } catch (error) {
    console.error("Error analyzing image with vision:", error);
    throw error;
  }
}

// Helper function to convert blob to base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default analyzeImageWithVision;