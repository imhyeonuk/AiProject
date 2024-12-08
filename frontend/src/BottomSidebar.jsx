// BottomSidebar.jsx
import React, { useState } from 'react';
import {
  FaHome,
  FaCamera,
  FaMusic,
  FaBell,
} from 'react-icons/fa';
import './BottomSidebar.css';

const BottomSidebar = ({ onHomeClick, isVideoVisible, toggleVideoVisibility, playMode, setPlayMode, setShowLeftSidebar }) => {
    const [showButtons, setShowButtons] = useState(true);
    const [co2Level, setCo2Level] = useState({
      value: 1500,
      status: 'normal'
    });
  
    const toggleMenu = () => {
      setShowButtons(!showButtons);
      setShowLeftSidebar(!showButtons);
    };

  return (
    <>
      {/* 하단 섹션 */}
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
            <span className="co2-label">CO2</span>
            <span className={`co2-value ${co2Level.status}`}>
              {co2Level.value}
            </span>
            <span className="co2-unit">ppm</span>
          </div>
        </div>

        <div className="section address-section">
          <div className="address-content">
            <i className="fas fa-building"></i>
            <span>부산광역시 남구 용소로 45 부경대학교 소민홀</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomSidebar;