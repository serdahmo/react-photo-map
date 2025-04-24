// src/utils/dateUtils.js

/**
 * Format a timestamp into a full date string
 * @param {number} timestamp - The timestamp in milliseconds
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    
    const date = new Date(timestamp);
    
    // Format: "Monday, June 12, 2023 at 3:45 PM"
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Format a timestamp into a shorter date string
   * @param {number} timestamp - The timestamp in milliseconds
   * @returns {string} Formatted short date string
   */
  export const formatShortDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    
    const date = new Date(timestamp);
    
    // Format: "Jun 12, 2023"
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  /**
   * Extract date from EXIF data string
   * @param {string} exifDate - EXIF date string in format "YYYY:MM:DD HH:MM:SS"
   * @returns {Date|null} JavaScript Date object or null if invalid
   */
  export const parseExifDate = (exifDate) => {
    if (!exifDate) return null;
    
    // EXIF DateTime format is typically: "YYYY:MM:DD HH:MM:SS"
    // We need to convert it to: "YYYY-MM-DD HH:MM:SS" for JavaScript Date parsing
    const formattedDate = exifDate.replace(/:/g, '-').replace(/-/g, ':').replace(/:/g, '-', 2);
    
    try {
      return new Date(formattedDate);
    } catch (e) {
      console.error("Error parsing EXIF date:", e);
      return null;
    }
  };