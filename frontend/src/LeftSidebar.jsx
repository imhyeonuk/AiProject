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

  // 메인 아이콘 결정
  const renderMainPlayModeIcon = () => {
    if (playMode === 'song') {
      return <FaMusic />;
    } else if (playMode === 'alarm') {
      return <FaBell />;
    }
    return <FaMusic />; // 기본 아이콘
  };

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
          {renderMainPlayModeIcon()}
        </button>
        {showPlayModeOptions && (
          <div className="options">
            <button
              className="iconButton"
              onClick={() => {
                setPlayMode('song');
                setShowPlayModeOptions(false); // 옵션 메뉴 닫기
              }}
            >
              <FaMusic color={playMode === 'song' ? 'blue' : 'black'} />
            </button>
            <button
              className="iconButton"
              onClick={() => {
                setPlayMode('alarm');
                setShowPlayModeOptions(false); // 옵션 메뉴 닫기
              }}
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
