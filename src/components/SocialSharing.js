// src/components/SocialSharing.js
import React, { useState, useEffect } from 'react';
import '../styles/social-sharing.css';

const SocialSharing = ({ 
  content, 
  images = [], 
  title = 'My Travel Journey', 
  description = 'Check out my travel photos and journey!'
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [customizedContent, setCustomizedContent] = useState('');
  const [customizedTitle, setCustomizedTitle] = useState(title);
  const [selectedImage, setSelectedImage] = useState(images.length > 0 ? images[0] : null);
  const [sharableLink, setSharableLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    setCustomizedTitle(title);
    setCustomizedContent(content || description);
    if (images.length > 0 && !selectedImage) {
      setSelectedImage(images[0]);
    }
  }, [content, title, description, images, selectedImage]);

  const socialPlatforms = [
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: '📘', 
      color: '#1877F2',
      contentLimit: 2000,
      shareUrl: 'https://www.facebook.com/sharer/sharer.php?u=',
      supportsImages: true 
    },
    { 
      id: 'twitter', 
      name: 'Twitter/X', 
      icon: '🐦', 
      color: '#1DA1F2',
      contentLimit: 280,
      shareUrl: 'https://twitter.com/intent/tweet?text=',
      supportsImages: true 
    },
    { 
      id: 'pinterest', 
      name: 'Pinterest', 
      icon: '📌', 
      color: '#E60023',
      contentLimit: 500,
      shareUrl: 'https://pinterest.com/pin/create/button/?description=',
      supportsImages: true,
      requiresImage: true
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: '📷', 
      color: '#C13584',
      contentLimit: 2200,
      supportsImages: true,
      requiresImage: true,
      manualInstructions: true
    },
    { 
      id: 'whatsapp', 
      name: 'WhatsApp', 
      icon: '💬', 
      color: '#25D366',
      contentLimit: 4000,
      shareUrl: 'https://api.whatsapp.com/send?text=',
      supportsImages: false
    },
    { 
      id: 'email', 
      name: 'Email', 
      icon: '✉️', 
      color: '#D44638',
      contentLimit: 10000,
      shareUrl: 'mailto:?subject=',
      supportsImages: false,
      titleInShareUrl: true
    },
    { 
      id: 'copy', 
      name: 'Copy Link', 
      icon: '🔗', 
      color: '#607D8B',
      supportsImages: false
    }
  ];

  const openShareModal = () => {
    setShowModal(true);
  };

  const closeShareModal = () => {
    setShowModal(false);
    setSelectedPlatform(null);
    setCopied(false);
  };

  const selectPlatform = (platform) => {
    setSelectedPlatform(platform);
    
    // Reset content based on platform limits
    const platformInfo = socialPlatforms.find(p => p.id === platform);
    if (platformInfo && platformInfo.contentLimit) {
      if (content && content.length > platformInfo.contentLimit) {
        setCustomizedContent(content.substring(0, platformInfo.contentLimit - 3) + '...');
      } else {
        setCustomizedContent(content || description);
      }
    }
  };

  const handleShare = () => {
    if (!selectedPlatform) return;
    
    const platform = socialPlatforms.find(p => p.id === selectedPlatform);
    if (!platform) return;
    
    // Check for required image
    if (platform.requiresImage && !selectedImage) {
      alert('Please select an image to share on ' + platform.name);
      return;
    }
    
    // Handle platforms that require manual instructions
    if (platform.manualInstructions) {
      // Already in modal showing instructions
      return;
    }
    
    // Handle copy to clipboard
    if (platform.id === 'copy') {
      navigator.clipboard.writeText(customizedContent)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          alert('Failed to copy to clipboard');
        });
      return;
    }
    
    // Handle other platforms with direct share URLs
    let shareUrl = platform.shareUrl;
    
    if (platform.titleInShareUrl) {
      // For email and similar platforms
      shareUrl += encodeURIComponent(customizedTitle) + '&body=' + encodeURIComponent(customizedContent);
    } else {
      // For social platforms
      shareUrl += encodeURIComponent(customizedContent);
    }
    
    // Open in a new window
    window.open(shareUrl, '_blank');
    
    // Close the modal after sharing
    closeShareModal();
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy to clipboard');
      });
  };

  const downloadSelectedImage = () => {
    if (!selectedImage) return;
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = selectedImage;
    a.download = `travel-photo-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="social-sharing">
      <button 
        className="share-button"
        onClick={openShareModal}
      >
        Share My Journey
      </button>
      
      {showModal && (
        <div className="share-modal-overlay" onClick={closeShareModal}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Share Your Journey</h2>
              <button className="close-button" onClick={closeShareModal}>×</button>
            </div>
            
            {!selectedPlatform ? (
              // Platform selection screen
              <div className="platform-selection">
                <h3>Choose a platform</h3>
                <div className="platforms-grid">
                  {socialPlatforms.map(platform => (
                    <div 
                      key={platform.id} 
                      className="platform-option"
                      style={{ borderColor: platform.color }}
                      onClick={() => selectPlatform(platform.id)}
                    >
                      <div className="platform-icon" style={{ backgroundColor: platform.color }}>
                        {platform.icon}
                      </div>
                      <div className="platform-name">{platform.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Platform specific sharing options
              <div className="sharing-options">
                {selectedPlatform === 'instagram' ? (
                  // Instagram requires manual sharing
                  <div className="instagram-instructions">
                    <h3>Share to Instagram</h3>
                    
                    {selectedImage && (
                      <div className="preview-image">
                        <img src={selectedImage} alt="Share preview" />
                      </div>
                    )}
                    
                    <div className="caption-section">
                      <h4>Caption</h4>
                      <textarea
                        value={customizedContent}
                        onChange={(e) => setCustomizedContent(e.target.value)}
                        placeholder="Write your caption here..."
                        maxLength={2200}
                      />
                      <div className="character-count">
                        {customizedContent.length}/2200
                      </div>
                      
                      <button 
                        className="copy-text-button"
                        onClick={() => handleCopyToClipboard(customizedContent)}
                      >
                        {copied ? 'Copied!' : 'Copy Caption'}
                      </button>
                    </div>
                    
                    <div className="manual-steps">
                      <h4>How to Share</h4>
                      <ol>
                        <li>Download the image below</li>
                        <li>Open Instagram on your device</li>
                        <li>Create a new post and select the downloaded image</li>
                        <li>Paste the caption</li>
                        <li>Share to your feed</li>
                      </ol>
                      
                      <button 
                        className="download-button"
                        onClick={downloadSelectedImage}
                        disabled={!selectedImage}
                      >
                        Download Image
                      </button>
                    </div>
                  </div>
                ) : (
                  // General sharing options for other platforms
                  <div className="general-sharing">
                    <h3>Share to {socialPlatforms.find(p => p.id === selectedPlatform)?.name}</h3>
                    
                    {socialPlatforms.find(p => p.id === selectedPlatform)?.supportsImages && (
                      <div className="media-selection">
                        <h4>Select Image</h4>
                        <div className="images-grid">
                          {images.map((img, index) => (
                            <div 
                              key={index}
                              className={`image-option ${selectedImage === img ? 'selected' : ''}`}
                              onClick={() => setSelectedImage(img)}
                            >
                              <img src={img} alt={`Option ${index + 1}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="content-section">
                      <h4>Customize Text</h4>
                      {selectedPlatform === 'email' && (
                        <input
                          type="text"
                          value={customizedTitle}
                          onChange={(e) => setCustomizedTitle(e.target.value)}
                          placeholder="Subject line..."
                          className="title-input"
                        />
                      )}
                      <textarea
                        value={customizedContent}
                        onChange={(e) => setCustomizedContent(e.target.value)}
                        placeholder="Write your message here..."
                        maxLength={socialPlatforms.find(p => p.id === selectedPlatform)?.contentLimit}
                      />
                      {socialPlatforms.find(p => p.id === selectedPlatform)?.contentLimit && (
                        <div className="character-count">
                          {customizedContent.length}/{socialPlatforms.find(p => p.id === selectedPlatform)?.contentLimit}
                        </div>
                      )}
                    </div>
                    
                    <div className="action-buttons">
                      <button 
                        className="back-button"
                        onClick={() => setSelectedPlatform(null)}
                      >
                        Back
                      </button>
                      
                      <button 
                        className="share-now-button"
                        onClick={handleShare}
                        style={{ backgroundColor: socialPlatforms.find(p => p.id === selectedPlatform)?.color }}
                      >
                        {selectedPlatform === 'copy' ? (copied ? 'Copied!' : 'Copy to Clipboard') : 'Share Now'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialSharing;