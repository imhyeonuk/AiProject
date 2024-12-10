import React from 'react';
import './BottomSidebar.css';

const BottomSidebar = ({ onHomeClick, isVideoVisible, toggleVideoVisibility, playMode, setPlayMode, setShowLeftSidebar, co2Level }) => {
  const toggleMenu = () => {
    setShowLeftSidebar((prev) => !prev);
  };

  return (
    <div className="bottom-container">
      <div className="section menu-section">
        <button className="hamburger-button" onClick={toggleMenu}>
          <div className="hamburger-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      <div className="section co2-section">
        <div className="co2-display">
          <span className="co2-label">CO<sub>2</sub></span>
          <span className={`co2-value ${co2Level > 1000 ? 'high' : co2Level > 800 ? 'medium' : 'low'}`}>
            {co2Level || 0}
          </span>
          <span className="co2-unit">ppm</span>
        </div>
      </div>

      <div className="section address-section">
        <div className="address-content">
          <i className="fas fa-building"></i>
          <span style={{fontSize:'16px'}}  >부산광역시 남구 용소로 45<br/>부경대학교 창의관</span>
        </div>
      </div>
    </div>
  );
};

export default BottomSidebar;
