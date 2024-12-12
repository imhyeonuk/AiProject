from fastapi import FastAPI
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
from ultralytics import YOLO
from collections import deque
import threading
import serial
import time

# FastAPI 앱 생성
app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 시리얼 및 카메라 초기화
try:
    ser = serial.Serial('/dev/ttyUSB0', 9600, timeout=1)
    print("Serial connection established.")
except serial.SerialException as e:
    print(f"Serial connection failed: {e}")
    ser = None

# 카메라 연결 시도
camera_index = 0  # 시작 인덱스
camera = None

while camera_index < 10:  # 최대 10개의 카메라까지 시도
    print(f"Trying camera index: {camera_index}")
    camera = cv2.VideoCapture(camera_index)
    if camera.isOpened():
        print(f"카메라가 성공적으로 열렸습니다! (Index: {camera_index})")
        break
    else:
        print(f"카메라 인덱스 {camera_index}를 열지 못했습니다.")
        camera.release()  # 잘못된 연결 객체 해제
        camera_index += 1
        camera = None

model = YOLO("best.pt")

# 전역 변수
classification = {"classification": 0}
detection_queue = deque(maxlen=5)
co2_value = {"co2" : 0}
stop_event = threading.Event()
serial_lock = threading.Lock()

# CO2 데이터를 읽는 스레드
def read_co2():
    global co2_value
    while not stop_event.is_set():
        with serial_lock:
            if ser and ser.is_open:
                try:
                    data = ser.readline().decode('utf-8').strip()
                    if data.startswith("CO2:"):
                        co2_value["co2"]= int(data.replace("CO2:", "").strip())
                        print(f"Received CO2: {co2_value}")
                except serial.SerialException as e:
                    print(f"Serial read error: {e}")
                except ValueError:
                    continue
        time.sleep(0.1)

# 아두이노로 데이터를 쓰는 함수
def write_prediction(data):
    with serial_lock:
        if ser and ser.is_open:
            try:
                ser.write(f"received:{data}\n".encode('utf-8'))
                print(f"Sent prediction: {data}")
            except serial.SerialException as e:
                print(f"Serial write error: {e}")

# YOLO 예측 수행 함수
def predict(frame):
    global detection_queue

    # 이미지 전처리: 1280x720 해상도로 리사이즈
    resized_frame = cv2.resize(frame, (1280, 720))

    # 모델 예측 수행
    results = model(resized_frame)

    class_ids = []
    for result in results:
        if result.boxes:
            # 클래스 및 신뢰도를 저장할 리스트
            boxes = []
            for box in result.boxes:
                class_id = int(box.cls[0])  # 클래스 번호
                confidence = float(box.conf[0])  # 감지 확률

                # 최소 신뢰도 조건 확인
                if confidence >= 0.7:
                    boxes.append((class_id, confidence))

            # boxes 리스트에서 가장 높은 confidence에 해당하는 클래스 선택
            if boxes:
                best_box = max(boxes, key=lambda x: x[1])  # confidence 기준으로 정렬
                class_ids.append(best_box[0])  # 가장 높은 confidence의 class_id 추가
                print(f"Selected Class: {best_box[0]}, Confidence: {best_box[1]:.2f}")
            else:
                class_ids.append(0)  # 신뢰도가 낮아 검출이 무시된 경우
        else:
            class_ids.append(0)  # 감지되지 않은 경우 클래스 번호 0
            print("No detection, Class: 0, Confidence: 0.0")
            
    detection_queue.append(class_ids)
    print("Detection Queue:", list(detection_queue))

    # 큐에 5개의 감지 결과가 쌓이면 classification 업데이트
    if len(detection_queue) == 5:
        get_classification(list(detection_queue))
        detection_queue.popleft()  # 가장 오래된 항목 제거

# Classification 대분류 설정 함수
def get_classification(detection_list):
    global classification
    counts = {1: 0, 2: 0}  # 1: 긴급, 2: 의심

    # Detection 결과 기반으로 카운트
    for detection in detection_list:
        for cls in detection:
            if cls > 0:  # 소분류가 0(미확인)이 아닌 경우만 처리
                if cls == 1:  # 1(꾸벅꾸벅 졸다) 긴급
                    counts[1] += 1
                else:  # 2(하품), 3(박수치다), 4(뺨을 때리다), 5(목을 만지다), 6(팔주무르기), 7(눈비비기)
                    counts[2] += 1

    # 대분류 판단
    if counts[1] >= 2:
        classification["classification"] = 1 # 긴급
        for _ in range(4) :
            detection_queue.popleft()
    elif counts[2] >= 2:
        classification["classification"] = 2   # 의심
        for _ in range(4) :
            detection_queue.popleft()
    else:
        classification["classification"] = 0  # 정상
    print("Updated Classification:", classification)

    
# /prediction 엔드포인트
@app.get("/prediction")
async def get_classification_endpoint():
    global classification # 전역 변수 classification를 함수 내로 끌고 오기
    classification["classification"] = 0 # classification 초기화
    if camera and camera.isOpened(): # camera 켜짐 유무 확인 후 프레임을 받음
        success, frame = camera.read() 
        if success: # 프레임을 잘 읽었다면 프레임을 ai 모델에 집어 넣고 classification 변수에 예측값을 저장 후 이를 아두이노로 보냄
            predict(frame) 
            write_prediction(classification["classification"])
    else:
        print("Camera is not opened or unavailable.") 
    return JSONResponse(content=classification) # 프론트엔드에 Json 파일 형식으로 보냄

# co2 보내주기
@app.get("/co2")
async def get_co2() :
    global co2_value # 전역 변수 co2_value를 함수 내로 끌고 오기
    return JSONResponse(content=co2_value) # 프론트엔드에 Json 파일 형식으로 보냄

# 비디오 스트리밍
@app.get("/video_feed")
async def video_feed():
    def generate_frames():
        while not stop_event.is_set(): # 이벤트가 설정되었는지 여부 확인 후 카메라로부터 frame을 받음
            success, frame = camera.read()
            if not success: # 카메라가 꺼져있으면 반복문을 끝냄
                break
            _, buffer = cv2.imencode('.jpg', frame) # frame을 '.jpg' 파일 형식으로 바꿈
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n') # frame을 산출

    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame") # StreamingResponse로 frame을 보냄

# 서버 시작 시 스레드 실행
def start_threads():
    threading.Thread(target=read_co2, daemon=True).start()
    print("CO2 thread started.")

# FastAPI 시작 및 종료 이벤트 처리
@app.on_event("startup")
async def startup_event():
    start_threads()

@app.on_event("shutdown")
async def shutdown_event():
    stop_event.set()
    if camera and camera.isOpened():
        camera.release()
    if ser and ser.is_open:
        ser.close()
    print("Resources released.")
