// Video.jsx

import { useEffect, useRef, useState } from 'react';
import alertSound from './assets/red-alert_nuclear_buzzer-99741.mp3';
import emergencyVoiceAlertSound from './assets/emergency_voice_alert.m4a';
import suspicionVoiceAlertSound from './assets/suspicion_voice_alert.m4a';
import songSample from './assets/sample_song.mp3';
import place_holder from './assets/place_holder.webp';
import './Video.css';
import { Rnd } from 'react-rnd';

function Video({ setDrowsyDetected, isVisible, playMode, volumeLevel, setDrowsyPopupMessage, setCo2PopupMessage, setCo2Level }) {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const alarmAudioRef = useRef(new Audio(alertSound));
  const emergencyVoiceAudioRef = useRef(new Audio(emergencyVoiceAlertSound));
  const suspicionVoiceAudioRef = useRef(new Audio(suspicionVoiceAlertSound));
  const songAudioRef = useRef(new Audio(songSample));
  const [imgSrc, setImgSrc] = useState(place_holder); // Placeholder 이미지
  const imageRef = useRef(null);

  // FastAPI URLs
  const videoFeedUrl = 'http://192.168.0.6/video_feed'; // FastAPI 비디오 스트림 URL
  const fastApiUrl = 'http://192.168.0.6/prediction'; // FastAPI 예측 값 URL (classification)
  const co2Url = "http://192.168.0.6/co2"; // FastAPI CO2 값 URL
  
  // 비디오 피드 초기화
  useEffect(() => {
    setImgSrc(videoFeedUrl); // FastAPI 비디오 스트림 URL 설정
  }, []);

  // CO2 값 가져오기
  useEffect(() => {
    const co2Interval = setInterval(() => {
      fetch(co2Url)
        .then(response => response.json())
        .then(data => {
          const co2Level = data.co2;
          console.log('CO2 값:', co2Level);
          setCo2Level(co2Level);
          handleCo2Signal(co2Level);
        })
        .catch(error => {
          console.error('CO2 Fetch Error:', error);
        });
    }, 1000);

    return () => clearInterval(co2Interval);
  }, [setCo2Level]);

  // 분류(classification) 값 가져오기
  useEffect(() => {
    const predictionInterval = setInterval(() => {
      if (isAlertActive) return;

      fetch(fastApiUrl)
        .then(response => response.json())
        .then(jsonData => {
          const classification = jsonData.classification;
          console.log('Classification:', classification);
          handleClassificationSignal(classification);
        })
        .catch(error => {
          console.error('Prediction Fetch Error:', error);
        });
    }, 1000);

    return () => clearInterval(predictionInterval);
  }, [isAlertActive]);

  // 분류 신호 처리
  const handleClassificationSignal = (classification) => {
    if (classification === 0) {
      console.log('정상 상태: 운전자 이상 행동이 없습니다.');
      setDrowsyPopupMessage('');
      setDrowsyDetected(false);
    } else if (classification === 1) {
      console.log('졸음운전 중입니다. 환기를 하십시오.');
      setDrowsyPopupMessage(
        <div className="drowsyPopupMessage emergency">
          졸음운전 중입니다. 환기를 하십시오.
        </div>
      );
      setIsAlertActive(true);
      setDrowsyDetected(true);
      playAlert(() => {
        emergencyVoiceAudioRef.current.play();
        emergencyVoiceAudioRef.current.onended = () => {
          setDrowsyPopupMessage('');
          setIsAlertActive(false);
        };
      });
    } else if (classification === 2) {
      console.log('졸음운전이 의심됩니다. 주의하세요.');
      setDrowsyPopupMessage(
        <div className="drowsyPopupMessage suspicion">
          졸음운전이 의심됩니다. 주의하세요.
        </div>
      );
      setIsAlertActive(true);
      setDrowsyDetected(true);
      playAlert(() => {
        suspicionVoiceAudioRef.current.play();
        suspicionVoiceAudioRef.current.onended = () => {
          setDrowsyPopupMessage('');
          setIsAlertActive(false);
        };
      });
    }
  };
  

  // CO2 신호 처리
  const handleCo2Signal = (co2Level) => {
    if (co2Level > 2000) {
        console.log('CO2 농도가 위험 수준입니다!\n환기를 권장합니다.');
        setCo2PopupMessage('CO2 농도가 위험 수준입니다!\n환기를 권장합니다.');
        // 추가적인 알림이나 행동을 원한다면 여기서 처리
    } else if (co2Level > 1600) {
        console.log('CO2 농도가 높습니다. 주의하세요.');
        setCo2PopupMessage('CO2 농도가 높습니다. 주의하세요.');
        // 추가적인 알림이나 행동을 원한다면 여기서 처리
    } else {
        setCo2PopupMessage('');
    }
};

  // 알림 재생
  const playAlert = (onEndCallback) => {
    if (playMode === 'alarm') {
      alarmAudioRef.current.play();
      alarmAudioRef.current.onended = onEndCallback;
    } else if (playMode === 'song') {
      songAudioRef.current.play();
      songAudioRef.current.onended = onEndCallback;
    }
  };

  // 볼륨 조정
  useEffect(() => {
    alarmAudioRef.current.volume = volumeLevel;
    emergencyVoiceAudioRef.current.volume = volumeLevel;
    suspicionVoiceAudioRef.current.volume = volumeLevel;
    songAudioRef.current.volume = volumeLevel;
  }, [volumeLevel]);

  return (
    <Rnd
      default={{
        x: window.innerWidth * 0.66,
        y: window.innerHeight * 0.5,
        width: window.innerWidth * 0.33,
        height: window.innerHeight * 0.5,
      }}
      bounds="parent"
      style={{
        position: 'absolute',
        zIndex: 1000,
        display: isVisible ? 'block' : 'none',
        touchAction: 'none', // 터치 이벤트 활성화
      }}
      enableResizing={{
        top: false,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: true, // 왼쪽 위 핸들만 활성화
      }}
      resizeHandleStyles={{
        topLeft: {
          width: '20px',
          height: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // 핸들 스타일 설정
          borderRadius: '50%',
          cursor: 'nwse-resize',
        },
      }}
      onResize={(e, direction, ref, delta, position) => {
        // 크기 조정 후 위치 및 크기 조정
        ref.style.width = `${ref.offsetWidth}px`;
        ref.style.height = `${ref.offsetHeight}px`;
      }}
    >
    
    <div className="videoContainer">
  <img
    ref={imageRef}
    src={imgSrc}
    alt="Video Stream"
    className="videoImage"
    onError={() => setImgSrc(place_holder)}
  />
  {isAlertActive && (
    <div>
      {drowsyPopupMessage}
    </div>
  )}
</div>

    </Rnd>
  );
}

export default Video;
