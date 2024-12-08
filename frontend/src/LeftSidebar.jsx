import React, { useState } from 'react';
import {
  FaHome,
  FaCamera,
  FaMusic,
  FaVolumeUp,
  FaVolumeMute,
  FaBell,
} from 'react-icons/fa';
import './LeftSidebar.css';

function LeftSidebar({
  onHomeClick,
  isVideoVisible,
  toggleVideoVisibility,
  playMode,
  setPlayMode,
  volumeLevel,
  setVolumeLevel,
  showLeftSidebar
}) {
  const [showPlayModeOptions, setShowPlayModeOptions] = useState(false);
  const [showVolumeOptions, setShowVolumeOptions] = useState(false);
  const handleVolumeChange = (event) => {
    setVolumeLevel(parseFloat(event.target.value));
  };
  if (!showLeftSidebar) return null;

  return (
    <div className="leftSidebar">
      <button className="iconButton" onClick={onHomeClick}>
        <FaHome />
      </button>

      <button className="iconButton" onClick={toggleVideoVisibility}>
        <FaCamera color={isVideoVisible ? 'blue' : 'gray'} />
      </button>

      <div className="iconWrapper">
        <button
          className="iconButton"
          onClick={() => setShowPlayModeOptions(!showPlayModeOptions)}
        >
          <FaMusic />
        </button>
        {showPlayModeOptions && (
          <div className="options">
            <button
              className="iconButton"
              onClick={() => setPlayMode('song')}
            >
              <FaMusic color={playMode === 'song' ? 'blue' : 'black'} />
            </button>
            <button
              className="iconButton"
              onClick={() => setPlayMode('alarm')}
            >
              <FaBell color={playMode === 'alarm' ? 'blue' : 'black'} />
            </button>
          </div>
        )}
      </div>

      <div className="iconWrapper">
        <button
          className="iconButton"
          onClick={() => setShowVolumeOptions(!showVolumeOptions)}
        >
          {volumeLevel === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        {showVolumeOptions && (
          <div className="volumeOptions">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volumeLevel}
              onChange={handleVolumeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default LeftSidebar;

