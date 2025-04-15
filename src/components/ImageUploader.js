import React, { useState } from 'react';
import EXIF from 'exif-js';

function ImageUploader({ onImagesLoaded }) {
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const imagesWithLocation = [];

    // Process each selected file
    files.forEach((file) => {
      EXIF.getData(file, function () {
        const lat = EXIF.getTag(this, 'GPSLatitude');
        const lon = EXIF.getTag(this, 'GPSLongitude');
        const latRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
        const lonRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'W';

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
          });
        } else {
          setError('Some images do not contain geolocation data.');
        }

        // Check if all files have been processed before calling the parent function
        if (imagesWithLocation.length === files.filter(f => f).length) {
          onImagesLoaded(imagesWithLocation);
        }
      });
    });
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default ImageUploader;
