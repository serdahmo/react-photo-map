// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './styles/global.css';
import './styles/blog-itinerary.css'; // Import our new styles
import './styles/floating-decorations.css'; // Import floating decorations styles
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ItineraryPage from './pages/ItineraryPage';
import BlogStyleItinerary from './pages/BlogStyleItinerary'; // Import our new component
import RecommendationsPage from './pages/RecommendationsPage';
import './styles/map-decorations.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/itinerary" element={<BlogStyleItinerary />} /> {/* Use our blog style as the main itinerary */}
            <Route path="/itinerary-classic" element={<ItineraryPage />} /> {/* Keep old version as backup */}
            <Route path="/recommendations" element={<RecommendationsPage />} />
            {/* Add a catch-all route that redirects to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;