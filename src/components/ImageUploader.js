// src/components/ImageUploader.js
import React, { useState } from 'react';
import EXIF from 'exif-js';
import '../styles/image-uploader.css';

function ImageUploader({ onImagesLoaded }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const processImages = (files) => {
    if (files.length === 0) return;

    setLoading(true);
    setError('');
    const imagesWithLocation = [];
    let processedCount = 0;

    // Process each selected file
    Array.from(files).forEach((file) => {
      // Create an image URL for display
      const imageUrl = URL.createObjectURL(file);

      EXIF.getData(file, function () {
        const lat = EXIF.getTag(this, 'GPSLatitude');
        const lon = EXIF.getTag(this, 'GPSLongitude');
        const latRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
        const lonRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'W';

        processedCount++;

        if (lat && lon) {
          // Helper function to convert DMS to Decimal Degrees
          const convertDMSToDD = (dms, ref) => {
            const [degrees, minutes, seconds] = dms;
            let dd = degrees + minutes / 60 + seconds / 3600;
            if (ref === 'S' || ref === 'W') {
              dd = dd * -1;
            }
            return dd;
          };

          const latitude = convertDMSToDD(lat, latRef);
          const longitude = convertDMSToDD(lon, lonRef);

          imagesWithLocation.push({
            fileName: file.name,
            latitude,
            longitude,
            imageUrl,
            timestamp: new Date().getTime()
          });
        } else {
          console.warn(`No geolocation data found in ${file.name}`);
        }

        // Check if all files have been processed
        if (processedCount === files.length) {
          setLoading(false);
          
          if (imagesWithLocation.length === 0) {
            setError('None of the selected images contain geolocation data.');
          } else if (imagesWithLocation.length < files.length) {
            setError(`${files.length - imagesWithLocation.length} of ${files.length} images did not contain geolocation data.`);
          }
          
          // Save to localStorage
          const existingMarkers = JSON.parse(localStorage.getItem('photoMarkers') || '[]');
          const allMarkers = [...existingMarkers, ...imagesWithLocation];
          localStorage.setItem('photoMarkers', JSON.stringify(allMarkers));
          
          onImagesLoaded(allMarkers);
        }
      });
    });
  };

  const handleFileChange = (e) => {
    processImages(e.target.files);
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImages(e.dataTransfer.files);
    }
  };

  return (
    <div className="image-uploader">
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          id="file-input"
          className="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          <div className="upload-icon">📷</div>
          <div className="upload-text">
            <span className="upload-title">Drop photos here or click to upload</span>
            <span className="upload-subtitle">Photos with location data will be added to your map</span>
          </div>
        </label>
      </div>
      
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Processing your photos...</p>
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default ImageUploader;