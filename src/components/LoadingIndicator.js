// src/components/LoadingIndicator.js
import React from 'react';
import '../styles/loading-indicator.css';

const LoadingIndicator = ({ progress, message }) => {
  return (
    <div className="loading-indicator">
      {progress !== undefined ? (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-percentage">{progress}%</span>
        </div>
      ) : (
        <div className="spinner"></div>
      )}
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingIndicator;