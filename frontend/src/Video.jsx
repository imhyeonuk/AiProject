import { useEffect, useRef, useState } from 'react';
import alertSound from './assets/red-alert_nuclear_buzzer-99741.mp3';
import emergencyVoiceAlertSound from './assets/emergency_voice_alert.m4a';
import suspicionVoiceAlertSound from './assets/suspicion_voice_alert.m4a';
import songSample from './assets/sample_song.mp3';
import place_holder from './assets/place_holder.webp';
import './Video.css';
import { Rnd } from 'react-rnd';

function Video({ setDrowsyDetected, isVisible, playMode, volumeLevel, setPopupMessage, setCo2Level }) {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const alarmAudioRef = useRef(new Audio(alertSound));
  const emergencyVoiceAudioRef = useRef(new Audio(emergencyVoiceAlertSound));
  const suspicionVoiceAudioRef = useRef(new Audio(suspicionVoiceAlertSound));
  const songAudioRef = useRef(new Audio(songSample));
  const [imgSrc, setImgSrc] = useState(place_holder); // Placeholder 이미지
  const imageRef = useRef(null);

  // FastAPI URL
  const videoFeedUrl = 'http://192.168.0.6:8000/video_feed'; // FastAPI 비디오 스트림 URL
  const fastApiUrl = 'http://192.168.0.6:8000/prediction'; // FastAPI 예측 값 URL

  // 비디오 피드 초기화
  useEffect(() => {
    setImgSrc(videoFeedUrl); // FastAPI 비디오 스트림 URL 설정
  }, []);

  // CO2 값 및 예측 신호 가져오기
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAlertActive) return;

      fetch(fastApiUrl)
        .then((response) => response.json())
        .then((jsonData) => {
          const classification = jsonData.classification;
          const co2Level = jsonData.co2;
          console.log('FastAPI 신호 값:', classification, 'CO2 값:', co2Level);
          setCo2Level(co2Level); // CO2 값을 상위 컴포넌트로 전달
          handleSignal(classification, co2Level);
        })
        .catch((error) => {
          console.error('FastAPI Fetch Error:', error);
        });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAlertActive, setCo2Level]);

  // 신호 처리
  const handleSignal = (classification, co2Level) => {
    if (classification === 0) {
      console.log('정상 상태: 운전자 이상 행동이 없습니다.');
      setPopupMessage('');
      setDrowsyDetected(false);
    } else if (classification === 1) {
      console.log('졸음운전 중입니다. 환기를 하십시오.');
      setPopupMessage('졸음운전 중입니다. 환기를 하십시오.');
      setIsAlertActive(true);
      setDrowsyDetected(true);
      playAlert(() => {
        emergencyVoiceAudioRef.current.play();
        emergencyVoiceAudioRef.current.onended = () => {
          setPopupMessage('');
          setIsAlertActive(false);
        };
      });
    } else if (classification === 2) {
      console.log('졸음운전이 의심됩니다. 주의하세요.');
      setPopupMessage('졸음운전이 의심됩니다. 주의하세요.');
      setIsAlertActive(true);
      setDrowsyDetected(true);
      playAlert(() => {
        suspicionVoiceAudioRef.current.play();
        suspicionVoiceAudioRef.current.onended = () => {
          setPopupMessage('');
          setIsAlertActive(false);
        };
      });
    }

    if (co2Level > 1000) {
      console.log('CO2 농도가 위험 수준입니다! 환기를 권장합니다.');
      setPopupMessage('CO2 농도가 위험 수준입니다! 환기를 권장합니다.');
    } else if (co2Level > 800) {
      console.log('CO2 농도가 높습니다. 주의하세요.');
      setPopupMessage('CO2 농도가 높습니다. 주의하세요.');
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
      style={{ position: 'absolute', zIndex: 1000, display: isVisible ? 'block' : 'none' }}
      enableResizing={{
        top: false,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: true,
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
      </div>
    </Rnd>
  );
}

export default Video;
