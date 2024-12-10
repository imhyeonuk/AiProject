// App.jsx

import { useState } from 'react';
import Video from './Video.jsx';
import NaverMap from './NaverMap.jsx';
import LeftSidebar from './LeftSidebar.jsx';
import './App.css';
import BottomSidebar from './BottomSidebar.jsx';
import Loading from './Loading.jsx'; // 추가된 Loading.jsx import

function App() {
  const [isAppLoaded, setIsAppLoaded] = useState(false); // 로딩 화면 상태 관리
  const [drowsyDetected, setDrowsyDetected] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(true); // 초기값 true로 설정
  const [playMode, setPlayMode] = useState('alarm');
  const [volumeLevel, setVolumeLevel] = useState(0.5);
  const [drowsyPopupMessage, setDrowsyPopupMessage] = useState(''); // 졸음운전 팝업 메시지 상태
  const [co2PopupMessage, setCo2PopupMessage] = useState(''); // CO2 팝업 메시지 상태
  const [showLeftSidebar, setShowLeftSidebar] = useState(true); // 버튼클릭시 버튼4개 사라지기 켜지기 기능
  const [co2Level, setCo2Level] = useState(0); // CO2 상태 추가

  // 홈버튼 클릭 시 초기화 함수
  const onHomeClick = () => {
    setIsVideoVisible(false);
    setPlayMode('alarm');
    setVolumeLevel(0.5);
    setDrowsyDetected(false);
    setDrowsyPopupMessage('');
    setCo2PopupMessage('');
  };

  const toggleVideoVisibility = () => {
    setIsVideoVisible(!isVideoVisible);
  };

  // 앱 로딩 화면 종료 핸들러
  const handleEnterApp = () => {
    setIsAppLoaded(true);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {!isAppLoaded ? (
        <Loading onEnterApp={handleEnterApp} /> // 로딩 화면 표시
      ) : (
        <>
          <NaverMap drowsyDetected={drowsyDetected} />

          <Video
            setDrowsyDetected={setDrowsyDetected}
            isVisible={isVideoVisible}
            playMode={playMode}
            volumeLevel={volumeLevel}
            setDrowsyPopupMessage={setDrowsyPopupMessage} // 졸음운전 팝업 설정 함수 전달
            setCo2PopupMessage={setCo2PopupMessage} // CO2 팝업 설정 함수 전달
            setCo2Level={setCo2Level} // CO2 값 전달
          />

          {/* 졸음운전 팝업 메시지 */}
          {drowsyPopupMessage && (
            <div className="drowsyPopupMessage">
              {drowsyPopupMessage}
            </div>
          )}

          {/* CO2 경고 팝업 메시지 */}
          {co2PopupMessage && (
            <div className="co2PopupMessage">
              {co2PopupMessage}
            </div>
          )}

          <div className="app-container">
            <LeftSidebar
              onHomeClick={onHomeClick}
              isVideoVisible={isVideoVisible}
              toggleVideoVisibility={toggleVideoVisibility}
              playMode={playMode}
              setPlayMode={setPlayMode}
              volumeLevel={volumeLevel}
              setVolumeLevel={setVolumeLevel}
              showLeftSidebar={showLeftSidebar}
            />

            <BottomSidebar
              onHomeClick={onHomeClick}
              isVideoVisible={isVideoVisible}
              toggleVideoVisibility={toggleVideoVisibility}
              playMode={playMode}
              setPlayMode={setPlayMode}
              setShowLeftSidebar={setShowLeftSidebar}
              co2Level={co2Level} // CO2 값 전달
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
