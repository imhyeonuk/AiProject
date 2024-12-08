import { useEffect, useRef, useState } from "react";
import drowsy_driving_icon from "./assets/drowsy_driving_icon.png";

function NaverMap({ drowsyDetected }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const currentPolylineRef = useRef(null);
  const restStopMarkersRef = useRef([]);
  const userMarkerRef = useRef(null);

  const restStops = [
    { name: "서부산휴게소", lat: 35.157258, lng: 128.948777 },
    { name: "김해금관가야휴게소", lat: 35.269933, lng: 129.003134 },
    { name: "양산휴게소", lat: 35.323172, lng: 129.056867 },
    { name: "장안휴게소(울산방향)", lat: 35.381033, lng: 129.248737 },
  ];

  // 네이버 지도 스크립트 로드
  useEffect(() => {
    const loadMapScript = () => {
      if (!window.naver) {
        const script = document.createElement("script");
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${import.meta.env.VITE_NAVER_CLIENT_ID}`;
        script.async = true;
        script.onload = () => initializeMap();
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      const mapOptions = {
        center: new window.naver.maps.LatLng(35.157258, 128.948777),
        zoom: 10,
      };
      const newMap = new window.naver.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
    };

    loadMapScript();
  }, []);

  // 현재 위치 실시간 추적
  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }

    return () => {
      if (navigator.geolocation && watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // 사용자 위치 마커 및 지도 중심 업데이트
  useEffect(() => {
    if (!map || !currentLocation) return;

    // 기존 사용자 마커 제거
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    // 새로운 사용자 마커 추가
    const userMarker = new window.naver.maps.Marker({
      map,
      position: new window.naver.maps.LatLng(
        currentLocation.lat,
        currentLocation.lng
      ),
      icon: {
        content: `<div style="width:50px;height:50px;background:url(${drowsy_driving_icon}) no-repeat center/contain;"></div>`,
        anchor: new window.naver.maps.Point(25, 25),
      },
    });
    userMarkerRef.current = userMarker;

    // 지도 중심을 현재 위치로 이동
    map.setCenter(new window.naver.maps.LatLng(currentLocation.lat, currentLocation.lng));
  }, [map, currentLocation]);

  // 졸음운전 감지 시 휴게소 마커 표시
  useEffect(() => {
    if (!map || !currentLocation) return;

    // 졸음운전이 감지되지 않았으면 휴게소 마커 제거
    if (!drowsyDetected) {
      restStopMarkersRef.current.forEach((marker) => marker.setMap(null));
      restStopMarkersRef.current = [];
      return;
    }

    // 이미 휴게소 마커가 추가되었으면 무시
    if (restStopMarkersRef.current.length > 0) return;

    // 휴게소 마커 추가
    restStops.forEach((그만) => {
      const marker = new window.naver.maps.Marker({
        map,
        position: new window.naver.maps.LatLng(stop.lat, stop.lng),
        title: stop.name,
      });

      restStopMarkersRef.current.push(marker);

      window.naver.maps.Event.addListener(marker, "click", async () => {
        if (currentPolylineRef.current) {
          currentPolylineRef.current.setMap(null);
        }

        const origin = `${currentLocation.lng},${currentLocation.lat}`;
        const destination = `${stop.lng},${stop.lat}`;
        await fetchRouteData(origin, destination);
      });
    });
  }, [map, currentLocation, drowsyDetected]);

  // 경로 데이터 요청 및 지도에 경로 표시
  const fetchRouteData = async (origin, destination) => {
    const url = `http://localhost:5000/directions?start=${origin}&goal=${destination}&option=trafast`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 0) {
        const routePath = data.route.trafast[0].path.map(
          (point) => new window.naver.maps.LatLng(point[1], point[0])
        );

        if (currentPolylineRef.current) {
          currentPolylineRef.current.setMap(null);
        }

        const polyline = new window.naver.maps.Polyline({
          map,
          path: routePath,
          strokeColor: "#00A000",
          strokeWeight: 5,
        });
        currentPolylineRef.current = polyline;

        // 경로 전체를 보여주도록 지도 영역 조정
        const bounds = new window.naver.maps.LatLngBounds();
        routePath.forEach((latlng) => bounds.extend(latlng));
        map.fitBounds(bounds);
      } else {
        console.error("경로를 가져올 수 없습니다:", data.message);
        alert("경로를 불러올 수 없습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("API 요청 중 오류 발생:", error);
      alert("API 요청 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
      ref={mapRef}
    >
      {!map && <p>Loading map...</p>}
    </div>
  );
}

export default NaverMap;
