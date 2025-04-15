import React, { useState } from 'react';
import './App.css'; // Use your own custom styles if needed
import ImageUploader from './components/ImageUploader';
import PhotoMap from './components/PhotoMap';

function App() {
  const [markers, setMarkers] = useState([]);

  return (
    <div className="App">
      <h1>My Photo Journey</h1>
      <ImageUploader onImagesLoaded={setMarkers} />
      {markers.length > 0 && <PhotoMap markers={markers} />}
    </div>
  );
}

export default App;
