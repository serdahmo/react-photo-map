// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>Map Your Memories</h1>
        <p>Upload your photos and create beautiful interactive maps of your travels</p>
        <Link to="/map" className="cta-button">Start Mapping</Link>
      </div>
      
      <section className="features">
        <div className="feature">
          <div className="feature-icon">🗺️</div>
          <h3>Interactive Maps</h3>
          <p>See your photos on beautiful, interactive maps</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📝</div>
          <h3>Auto Itineraries</h3>
          <p>Generate travel itineraries from your photos</p>
        </div>
        <div className="feature">
          <div className="feature-icon">💡</div>
          <h3>Smart Recommendations</h3>
          <p>Get personalized travel recommendations</p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;