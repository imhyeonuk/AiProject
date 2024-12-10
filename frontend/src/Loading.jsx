import React, { useState } from 'react';
import './Loading.css'; // CSS 파일
import joloApp from './assets/JOLO.png'; // JOLO 어플리케이션 이미지
import fakeApp1 from './assets/1-removebg-preview.png';
import fakeApp2 from './assets/2-removebg-preview.png';
import fakeApp3 from './assets/3-removebg-preview.png';
import fakeApp4 from './assets/4-removebg-preview.png';
import fakeApp5 from './assets/5-removebg-preview.png';
import fakeApp6 from './assets/6-removebg-preview.png';
import fakeApp7 from './assets/7-removebg-preview.png';

function Loading({ onEnterApp }) {
  const [isLoading, setIsLoading] = useState(false);

  const appImages = [
    fakeApp1,
    fakeApp2,
    fakeApp3,
    fakeApp4,
    fakeApp5,
    fakeApp6,
    fakeApp7,
    joloApp, // JOLO 어플리케이션 이미지
  ];

  const handleImageClick = (index) => {
    if (index === appImages.length - 1) {
      // JOLO 어플리케이션 이미지 클릭
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onEnterApp(); // App.jsx로 이동
      }, 1000); // 1초 후 이동
    }
  };

  return (
    <div className="loading-container">
      <div className="image-grid">
        {appImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`App ${index + 1}`}
            className={`app-image ${index === appImages.length - 1 ? 'highlight' : ''}`}
            onClick={() => handleImageClick(index)}
          />
        ))}
      </div>
      {isLoading && <div className="loading-overlay">Loading.....</div>}
    </div>
  );
}

export default Loading;
