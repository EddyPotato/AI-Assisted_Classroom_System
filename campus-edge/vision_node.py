import cv2
import os
import glob
import time
import json
import numpy as np
from pyzbar import pyzbar
import paho.mqtt.publish as publish
import face_recognition
from flask import Flask, Response, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
REFERENCE_FACES_DIR = r"C:\Users\EdTech\OneDrive\Desktop\AI-Assisted_Classroom_System\campus-backend\ReferenceFaces"
MQTT_BROKER = "localhost"
FACE_MATCH_TIMEOUT = 6.0 

# --- HARDWARE STATE CONTROL ---
camera_active = False # Flag controlled by React UI

# --- STATE MACHINE VARIABLES ---
current_state = "SCANNING_BARCODE"
target_student_id = ""
target_face_encoding = None
verification_start_time = 0

# === ON-DEMAND CAMERA APIS ===
@app.route('/start_camera', methods=['POST'])
def start_camera():
    global camera_active
    camera_active = True
    print("\n[SYSTEM] Guard Portal Connected. Waking up camera...")
    return jsonify({"status": "success"})

@app.route('/stop_camera', methods=['POST'])
def stop_camera():
    global camera_active
    camera_active = False
    print("\n[SYSTEM] Guard Portal Closed. Camera put to sleep.")
    return jsonify({"status": "success"})

# === CORE VISION LOOP ===
def generate_frames():
    global camera_active, current_state, target_student_id, target_face_encoding, verification_start_time
    
    camera = None
    frame_counter = 0
    
    # We store the bounding boxes here so they display smoothly even on skipped frames!
    draw_rects = []
    draw_texts = []

    while True:
        # 1. Handle Sleep State
        if not camera_active:
            if camera is not None:
                camera.release()
                camera = None
                print("[HARDWARE] Webcam fully released.")
            time.sleep(0.5)
            continue

        # 2. Handle Wake State (Thread-Safe Initialization)
        if camera is None:
            # cv2.CAP_DSHOW is the magic flag that prevents the Windows Black Screen bug!
            camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)
            camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            print("[HARDWARE] Webcam ACTIVE and bound to video thread.")

        success, frame = camera.read()
        if not success:
            time.sleep(0.1)
            continue

        current_time = time.time()
        frame_counter += 1

        # ==========================================
        # AI FRAME SKIPPING (Optimize CPU)
        # Process heavy math only every 3rd frame
        # ==========================================
        process_this_frame = (frame_counter % 3 == 0)

        if process_this_frame:
            draw_rects = [] # Clear old boxes
            draw_texts = [] # Clear old text

            # ------------------------------------------
            # PHASE 1: BARCODE DETECTION
            # ------------------------------------------
            if current_state == "SCANNING_BARCODE":
                # Convert to Grayscale for 3x faster barcode scanning
                gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                barcodes = pyzbar.decode(gray_frame)
                
                for barcode in barcodes:
                    (x, y, w, h) = barcode.rect
                    barcode_data = barcode.data.decode("utf-8").strip()
                    
                    # Save drawing instructions for the video thread
                    draw_rects.append(((x, y), (x + w, y + h), (255, 191, 0)))
                    draw_texts.append((f"ID: {barcode_data}", (x, y - 10), (255, 191, 0)))

                    print(f"\n[PHASE 1] Barcode Scanned: {barcode_data}")
                    payload = json.dumps({"student_id": barcode_data})
                    publish.single("campus/door/scan", payload=payload, hostname=MQTT_BROKER)
                    
                    search_pattern = os.path.join(REFERENCE_FACES_DIR, f"*{barcode_data}*.*")
                    matching_files = glob.glob(search_pattern)
                    
                    if matching_files:
                        ref_image_path = matching_files[0]
                        try:
                            print("[SYSTEM] Compiling strict 128D map from photo...")
                            ref_image = face_recognition.load_image_file(ref_image_path)
                            encodings = face_recognition.face_encodings(ref_image, num_jitters=10)
                            
                            if len(encodings) > 0:
                                target_face_encoding = encodings[0]
                                target_student_id = barcode_data
                                
                                print("[PHASE 1] Ready. Give student 2.5s to look up.")
                                time.sleep(2.5) # Breathe time
                                
                                current_state = "VERIFYING_FACE"
                                verification_start_time = time.time()
                                draw_rects.clear() # Clear barcode box immediately
                                draw_texts.clear()
                            else:
                                publish.single("campus/door/verified", payload=json.dumps({"status": "denied"}), hostname=MQTT_BROKER)
                                time.sleep(2)
                        except Exception as e:
                            pass
                    else:
                        publish.single("campus/door/verified", payload=json.dumps({"status": "denied"}), hostname=MQTT_BROKER)
                        time.sleep(2)

            # ------------------------------------------
            # PHASE 2: STRICT FACE RECOGNITION
            # ------------------------------------------
            elif current_state == "VERIFYING_FACE":
                cv2.putText(frame, "BIOMETRIC SCAN IN PROGRESS...", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
                
                # Compress frame to 1/4 size for AI speed
                small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
                rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
                
                face_locations = face_recognition.face_locations(rgb_small_frame)
                face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
                
                match_found = False
                
                for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
                    top *= 4; right *= 4; bottom *= 4; left *= 4
                    
                    face_distances = face_recognition.face_distance([target_face_encoding], face_encoding)
                    best_match_index = np.argmin(face_distances)
                    match_distance = face_distances[best_match_index]
                    
                    STRICT_THRESHOLD = 0.45 
                    
                    if match_distance <= STRICT_THRESHOLD:
                        match_found = True
                        confidence = round((1.0 - match_distance) * 100, 1)
                        draw_rects.append(((left, top), (right, bottom), (0, 255, 0)))
                        draw_texts.append((f"MATCH: {confidence}%", (left, top - 10), (0, 255, 0)))
                        break
                    else:
                        draw_rects.append(((left, top), (right, bottom), (0, 165, 255)))
                        draw_texts.append((f"POOR MATCH: {round(match_distance, 2)}", (left, top - 10), (0, 165, 255)))

                if match_found:
                    print(f"[SUCCESS] Identity Confirmed for {target_student_id}")
                    publish.single("campus/door/verified", payload=json.dumps({"status": "approved"}), hostname=MQTT_BROKER)
                    current_state = "SCANNING_BARCODE"
                    time.sleep(2)
                    
                elif (current_time - verification_start_time) > FACE_MATCH_TIMEOUT:
                    print(f"[FAILED] Match timeout for {target_student_id}")
                    publish.single("campus/door/verified", payload=json.dumps({"status": "denied"}), hostname=MQTT_BROKER)
                    current_state = "SCANNING_BARCODE"
                    time.sleep(2)

        # ==========================================
        # VIDEO RENDERING (Runs EVERY frame for 30fps)
        # ==========================================
        for (pt1, pt2, color) in draw_rects:
            cv2.rectangle(frame, pt1, pt2, color, 3)
        for (text, pt, color) in draw_texts:
            cv2.putText(frame, text, pt, cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

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