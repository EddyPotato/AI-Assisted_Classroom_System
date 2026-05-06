import cv2
import os
import glob
import time
import json
from pyzbar import pyzbar
import paho.mqtt.publish as publish
import face_recognition
from flask import Flask, Response, jsonify
from flask_cors import CORS
import threading

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
REFERENCE_FACES_DIR = r"C:\Users\EdTech\OneDrive\Desktop\AI-Assisted_Classroom_System\campus-backend\ReferenceFaces"
MQTT_BROKER = "localhost"
FACE_MATCH_TIMEOUT = 6.0 

# --- HARDWARE STATE CONTROL ---
camera = None
camera_lock = threading.Lock() # Prevents crashes when turning the camera on/off

# --- STATE MACHINE VARIABLES ---
current_state = "SCANNING_BARCODE"
target_student_id = ""
target_face_encoding = None
verification_start_time = 0

# === ON-DEMAND CAMERA APIS ===
@app.route('/start_camera', methods=['POST'])
def start_camera():
    global camera
    with camera_lock:
        if camera is None or not camera.isOpened():
            print("\n[HARDWARE] Guard Portal connected. Initializing Webcam...")
            camera = cv2.VideoCapture(0)
            camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            print("[HARDWARE] Webcam is ACTIVE and locked to Portal.")
    return jsonify({"status": "success"})

@app.route('/stop_camera', methods=['POST'])
def stop_camera():
    global camera
    with camera_lock:
        if camera is not None and camera.isOpened():
            print("\n[HARDWARE] Guard Portal closed. Releasing Webcam...")
            camera.release()
            camera = None
            print("[HARDWARE] Webcam is OFF. Device is now free.")
    return jsonify({"status": "success"})

# === CORE VISION LOOP ===
def generate_frames():
    global current_state, target_student_id, target_face_encoding, verification_start_time, camera
    
    while True:
        # Safely grab a frame only if the camera is currently active
        with camera_lock:
            if camera is None or not camera.isOpened():
                time.sleep(0.5) # Idle quietly while waiting for React to start the camera
                continue
            success, frame = camera.read()
            
        if not success:
            time.sleep(0.1)
            continue
            
        current_time = time.time()

        # ==========================================
        # PHASE 1: BARCODE DETECTION
        # ==========================================
        if current_state == "SCANNING_BARCODE":
            barcodes = pyzbar.decode(frame)
            
            for barcode in barcodes:
                (x, y, w, h) = barcode.rect
                barcode_data = barcode.data.decode("utf-8").strip()
                print(f"\n[PHASE 1] Barcode Scanned: {barcode_data}")
                
                # 1. Trigger React UI "Scanning Face..."
                payload = json.dumps({"student_id": barcode_data})
                publish.single("campus/door/scan", payload=payload, hostname=MQTT_BROKER)
                
                # 2. Hunt for the reference image
                search_pattern = os.path.join(REFERENCE_FACES_DIR, f"*{barcode_data}*.*")
                matching_files = glob.glob(search_pattern)
                
                if matching_files:
                    ref_image_path = matching_files[0]
                    try:
                        ref_image = face_recognition.load_image_file(ref_image_path)
                        encodings = face_recognition.face_encodings(ref_image)
                        
                        if len(encodings) > 0:
                            target_face_encoding = encodings[0]
                            target_student_id = barcode_data
                            
                            print("[PHASE 1] Reference loaded. Giving student 2.5 seconds to look up...")
                            time.sleep(2.5) # THE BREATHE TIME DELAY
                            
                            current_state = "VERIFYING_FACE"
                            verification_start_time = time.time()
                        else:
                            print("[ERROR] No face detected in reference photo!")
                            time.sleep(1.5)
                            publish.single("campus/door/verified", payload=json.dumps({"status": "denied"}), hostname=MQTT_BROKER)
                            time.sleep(2)
                    except Exception as e:
                        pass
                else:
                    print(f"[ERROR] No registered photo found for {barcode_data}! Cannot verify face.")
                    time.sleep(2.0)
                    publish.single("campus/door/verified", payload=json.dumps({"status": "denied"}), hostname=MQTT_BROKER)
                    time.sleep(2)

        # ==========================================
        # PHASE 2: FACE RECOGNITION MATCHING
        # ==========================================
        elif current_state == "VERIFYING_FACE":
            cv2.putText(frame, "BIOMETRIC SCAN IN PROGRESS...", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
            
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
            
            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
            
            match_found = False
            
            for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
                top *= 4; right *= 4; bottom *= 4; left *= 4
                matches = face_recognition.compare_faces([target_face_encoding], face_encoding, tolerance=0.6)
                
                if matches[0]:
                    match_found = True
                    cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 3) 
                    cv2.putText(frame, "MATCH APPROVED", (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                    break
                else:
                    cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2) 
                    cv2.putText(frame, "ANALYZING...", (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

            if match_found:
                print(f"[SUCCESS] Identity Confirmed for {target_student_id}")
                publish.single("campus/door/verified", payload=json.dumps({"status": "approved"}), hostname=MQTT_BROKER)
                current_state = "SCANNING_BARCODE"
                time.sleep(2)
                
            elif (current_time - verification_start_time) > FACE_MATCH_TIMEOUT:
                print(f"[FAILED] Face match timeout for {target_student_id}")
                publish.single("campus/door/verified", payload=json.dumps({"status": "denied"}), hostname=MQTT_BROKER)
                current_state = "SCANNING_BARCODE"
                time.sleep(2)

        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    print("\n=======================================================")
    print("[SYSTEM] Booting AI Edge Node Server on port 5000...")
    print("[SYSTEM] Hardware is currently ASLEEP. Waiting for Guard Portal connection.")
    print("=======================================================\n")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)