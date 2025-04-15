// src/components/ApiKeyConfig.js
import React, { useState, useEffect } from 'react';
import '../styles/api-key-config.css';

function ApiKeyConfig({ onKeySaved }) {
  const [apiKey, setApiKey] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  useEffect(() => {
    // Check if API key is stored in localStorage
    const savedKey = localStorage.getItem('openAiKey');
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySet(true);
    } else {
      setIsEditMode(true);
    }
  }, []);
  
  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openAiKey', apiKey.trim());
      setIsKeySet(true);
      setIsEditMode(false);
      
      if (onKeySaved) {
        onKeySaved(apiKey.trim());
      }
    }
  };
  
  const handleEditKey = () => {
    setIsEditMode(true);
  };
  
  return (
    <div className="api-key-config">
      <div className="key-header">
        <h3>OpenAI API Key</h3>
        {isKeySet && !isEditMode && (
          <button 
            className="edit-key-button"
            onClick={handleEditKey}
          >
            Edit Key
          </button>
        )}
      </div>
      
      {isEditMode ? (
        <div className="key-input-section">
          <p>Enter your OpenAI API key to enable AI recommendations</p>
          <div className="key-input-container">
            <input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="key-input"
            />
            <button 
              className="save-key-button"
              onClick={handleSaveKey}
              disabled={!apiKey.trim()}
            >
              Save Key
            </button>
          </div>
          <p className="key-privacy-note">
            Your API key is stored securely in your browser's local storage and is never sent to our servers.
          </p>
        </div>
      ) : (
        isKeySet && (
          <div className="key-status">
            <p>
              <span className="key-status-icon">✓</span>
              API key is configured
            </p>
          </div>
        )
      )}
    </div>
  );
}

export default ApiKeyConfig;