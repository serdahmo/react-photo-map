// src/components/LocationDecorations.js
import React from 'react';
import '../styles/floating-decorations.css';

// Helper function to determine location type from location name and description
const determineLocationType = (locationName, description) => {
  const name = locationName?.toLowerCase() || '';
  const desc = description?.toLowerCase() || '';
  
  // Define keywords for each location type
  const keywords = {
    tropical: ['beach', 'island', 'tropical', 'coast', 'ocean', 'palm', 'caribbean', 'hawaii', 'bali', 'resort'],
    mountain: ['mountain', 'hiking', 'forest', 'nature', 'national park', 'wilderness', 'alps', 'hill', 'valley', 'trek'],
    urban: ['city', 'downtown', 'urban', 'metropolis', 'skyline', 'street', 'building', 'modern', 'architecture'],
    desert: ['desert', 'sand', 'dune', 'arid', 'cactus', 'dry', 'sahara', 'canyon', 'mesa', 'hot'],
    historic: ['historic', 'ancient', 'ruins', 'castle', 'museum', 'temple', 'church', 'monument', 'palace', 'archaeology'],
    winter: ['snow', 'winter', 'ice', 'cold', 'ski', 'snowboard', 'glacier', 'arctic', 'frost', 'freezing']
  };
  
  // Check for matches in both name and description
  for (const [type, typeKeywords] of Object.entries(keywords)) {
    if (typeKeywords.some(keyword => name.includes(keyword) || desc.includes(keyword))) {
      return type;
    }
  }
  
  // Default to urban if no match found
  return 'urban';
};

const LocationDecorations = ({ locationName, description }) => {
  const locationType = determineLocationType(locationName, description);
  
  const renderDecorations = () => {
    switch(locationType) {
      case 'tropical':
        return (
          <div className="decoration-container tropical">
            <div className="floating-decoration tropical-decoration palm-1 decoration-slow">🌴</div>
            <div className="floating-decoration tropical-decoration palm-2 decoration-medium">🌴</div>
            <div className="floating-decoration tropical-decoration shell decoration-fast">🐚</div>
            <div className="floating-decoration tropical-decoration sun decoration-medium">☀️</div>
            <div className="floating-decoration tropical-decoration decoration-slow" style={{ top: '60%', left: '15%' }}>🌊</div>
            <div className="floating-decoration tropical-decoration decoration-medium" style={{ top: '25%', right: '25%' }}>🥥</div>
          </div>
        );
      
      case 'mountain':
        return (
          <div className="decoration-container mountain">
            <div className="floating-decoration mountain-decoration mountain-1 decoration-slow">⛰️</div>
            <div className="floating-decoration mountain-decoration mountain-2 decoration-medium">🏔️</div>
            <div className="floating-decoration mountain-decoration pine-tree decoration-fast">🌲</div>
            <div className="floating-decoration mountain-decoration camping decoration-medium">🏕️</div>
            <div className="floating-decoration mountain-decoration decoration-slow" style={{ top: '65%', left: '10%' }}>🦌</div>
            <div className="floating-decoration mountain-decoration decoration-medium" style={{ top: '15%', right: '35%' }}>🌿</div>
          </div>
        );
      
      case 'urban':
        return (
          <div className="decoration-container urban">
            <div className="floating-decoration urban-decoration building-1 decoration-slow">🏙️</div>
            <div className="floating-decoration urban-decoration building-2 decoration-medium">🏢</div>
            <div className="floating-decoration urban-decoration taxi decoration-fast">🚕</div>
            <div className="floating-decoration urban-decoration monument decoration-medium">🗽</div>
            <div className="floating-decoration urban-decoration decoration-slow" style={{ top: '55%', left: '8%' }}>🚦</div>
            <div className="floating-decoration urban-decoration decoration-medium" style={{ top: '10%', right: '30%' }}>☕</div>
          </div>
        );
      
      case 'desert':
        return (
          <div className="decoration-container desert">
            <div className="floating-decoration desert-decoration cactus-1 decoration-slow">🌵</div>
            <div className="floating-decoration desert-decoration cactus-2 decoration-medium">🌵</div>
            <div className="floating-decoration desert-decoration pyramid decoration-fast">🏜️</div>
            <div className="floating-decoration desert-decoration camel decoration-medium">🐪</div>
            <div className="floating-decoration desert-decoration decoration-slow" style={{ top: '60%', left: '15%' }}>🌞</div>
            <div className="floating-decoration desert-decoration decoration-medium" style={{ top: '20%', right: '25%' }}>🦂</div>
          </div>
        );
      
      case 'historic':
        return (
          <div className="decoration-container historic">
            <div className="floating-decoration historic-decoration landmark-1 decoration-slow">🏛️</div>
            <div className="floating-decoration historic-decoration landmark-2 decoration-medium">🏰</div>
            <div className="floating-decoration historic-decoration pillar decoration-fast">🗿</div>
            <div className="floating-decoration historic-decoration statue decoration-medium">⚱️</div>
            <div className="floating-decoration historic-decoration decoration-slow" style={{ top: '50%', left: '10%' }}>📜</div>
            <div className="floating-decoration historic-decoration decoration-medium" style={{ top: '15%', right: '35%' }}>🏺</div>
          </div>
        );
      
      case 'winter':
        return (
          <div className="decoration-container winter">
            <div className="floating-decoration winter-decoration snowflake-1 decoration-slow">❄️</div>
            <div className="floating-decoration winter-decoration snowflake-2 decoration-medium">❄️</div>
            <div className="floating-decoration winter-decoration snowman decoration-fast">⛄</div>
            <div className="floating-decoration winter-decoration ski decoration-medium">🎿</div>
            <div className="floating-decoration winter-decoration decoration-slow" style={{ top: '60%', left: '18%' }}>🧊</div>
            <div className="floating-decoration winter-decoration decoration-medium" style={{ top: '25%', right: '28%' }}>🧣</div>
          </div>
        );
      
      default:
        return (
          <div className="decoration-container urban">
            <div className="floating-decoration urban-decoration building-1 decoration-slow">🏙️</div>
            <div className="floating-decoration urban-decoration building-2 decoration-medium">🏢</div>
            <div className="floating-decoration urban-decoration decoration-fast" style={{ bottom: '20%', left: '18%' }}>📸</div>
            <div className="floating-decoration urban-decoration decoration-medium" style={{ bottom: '15%', right: '22%' }}>🌍</div>
          </div>
        );
    }
  };
  
  return renderDecorations();
};

export default LocationDecorations;