import cv2
import os
import glob
import time
import json
import threading
import numpy as np
from pyzbar import pyzbar
import paho.mqtt.publish as publish
import face_recognition
from flask import Flask, Response, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
REFERENCE_FACES_DIR = r"C:\Users\EdTech\OneDrive\Desktop\AI-Assisted_Classroom_System\campus-backend\ReferenceFaces"
MQTT_BROKER = "localhost"
FACE_MATCH_TIMEOUT = 6.0 
CAMERA_WIDTH = 960
CAMERA_HEIGHT = 540
CAMERA_FPS = 15
BARCODE_SCAN_INTERVAL = 0.25
BARCODE_DEEP_SCAN_INTERVAL = 1.25
FACE_PROCESS_EVERY_N_FRAMES = 4
JPEG_QUALITY = 75
SHARPEN_KERNEL = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])

# --- HARDWARE STATE CONTROL ---
camera_active = False # Flag controlled by React UI
current_location_id = "CAM-001" # Default fallback
stream_lock = threading.Lock()
state_lock = threading.Lock()

# --- STATE MACHINE VARIABLES ---
current_state = "SCANNING_BARCODE"
target_student_id = ""
target_face_encoding = None
verification_start_time = 0

def _decode_image_variant(image, scale, offset_x, offset_y):
    detections = []
    for barcode in pyzbar.decode(image):
        x, y, w, h = barcode.rect
        barcode_data = barcode.data.decode("utf-8", errors="ignore").strip()
        if not barcode_data:
            continue

        detections.append({
            "data": barcode_data,
            "rect": (
                int(x / scale) + offset_x,
                int(y / scale) + offset_y,
                max(1, int(w / scale)),
                max(1, int(h / scale))
            )
        })
    return detections

def decode_barcodes_robust(frame, deep_scan=False):
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    height, width = gray_frame.shape

    regions = [
        (
            gray_frame[int(height * 0.45):int(height * 0.98), int(width * 0.05):int(width * 0.95)],
            int(width * 0.05),
            int(height * 0.45)
        ),
        (gray_frame, 0, 0),
    ]

    seen = set()
    results = []
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))

    for region, offset_x, offset_y in regions:
        if region.size == 0:
            continue

        enhanced = clahe.apply(region)
        fast_variants = ((region, (1.0,)), (enhanced, (1.0, 2.0)))

        for base_image, scales in fast_variants:
            for scale in scales:
                image_to_decode = base_image
                if scale != 1.0:
                    image_to_decode = cv2.resize(base_image, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

                for detection in _decode_image_variant(image_to_decode, scale, offset_x, offset_y):
                    if detection["data"] in seen:
                        continue
                    seen.add(detection["data"])
                    results.append(detection)

            if results:
                break

        if results:
            break

        if not deep_scan:
            continue

        sharpened = cv2.filter2D(enhanced, -1, SHARPEN_KERNEL)
        _, otsu = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        for base_image in (sharpened, otsu):
            for scale in (1.0, 2.0):
                image_to_decode = base_image
                if scale != 1.0:
                    image_to_decode = cv2.resize(base_image, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

                for detection in _decode_image_variant(image_to_decode, scale, offset_x, offset_y):
                    if detection["data"] in seen:
                        continue
                    seen.add(detection["data"])
                    results.append(detection)

            if results:
                break

        if results:
            break

    return results

def publish_verification(status):
    publish.single(
        "campus/door/verified",
        payload=json.dumps({"status": status, "camera_location_id": current_location_id}),
        hostname=MQTT_BROKER
    )

# === ON-DEMAND CAMERA APIS ===
@app.route('/start_camera', methods=['POST'])
def start_camera():
    global camera_active, current_location_id
    
    # Extract location ID sent by the C# backend
    data = request.get_json(silent=True) or {}
    if "location_id" in data and data["location_id"]:
        current_location_id = data["location_id"]
        
    camera_active = True
    print(f"\n[SYSTEM] Guard Portal Connected at {current_location_id}. Waking up camera...")
    return jsonify({"status": "success", "location": current_location_id})

@app.route('/stop_camera', methods=['POST'])
def stop_camera():
    global camera_active
    camera_active = False
    print("\n[SYSTEM] Guard Portal Closed. Camera put to sleep.")
    return jsonify({"status": "success"})

@app.route('/manual_scan', methods=['POST'])
def manual_scan():
    """Triggered by the C# Backend when the Guard types a student ID manually."""
    global current_state, target_student_id, target_face_encoding, verification_start_time, current_location_id
    
    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id")
    
    if not student_id:
        return jsonify({"status": "error", "message": "No student ID provided"}), 400
        
    print(f"\n[PHASE 1] Manual Scan Triggered from Backend for: {student_id}")
    
    # Load encoding
    search_pattern = os.path.join(REFERENCE_FACES_DIR, f"*{student_id}*.*")
    matching_files = glob.glob(search_pattern)
    
    if matching_files:
        ref_image_path = matching_files[0]
        try:
            print(f"[SYSTEM] Compiling 128D map from photo for {student_id}...")
            ref_image = face_recognition.load_image_file(ref_image_path)
            encodings = face_recognition.face_encodings(ref_image, num_jitters=10)
            
            if len(encodings) > 0:
                target_face_encoding = encodings[0]
                target_student_id = student_id
                with state_lock:
                    current_state = "VERIFYING_FACE"
                    verification_start_time = time.time()
                print("[PHASE 1] Ready for Manual Verification.")
                return jsonify({"status": "success"})
        except Exception as e:
            print(f"[ERROR] Could not encode face: {e}")
            pass
            
    print(f"[PHASE 1] Face data not found for {student_id}. Emitting denied.")
    # If no face is found, emit denied so the UI resets
    publish_verification("denied")
    return jsonify({"status": "error", "message": "Face data not found"})

# === CORE VISION LOOP ===
def generate_frames():
    global camera_active, current_state, target_student_id, target_face_encoding, verification_start_time, current_location_id
    
    if not stream_lock.acquire(blocking=False):
        print("[STREAM] Duplicate /video_feed connection detected. Waiting for the active stream to close...")
        if not stream_lock.acquire(timeout=3):
            print("[STREAM] Duplicate /video_feed connection ignored. Webcam is still owned by an active stream.")
            return

    camera = None
    frame_counter = 0
    last_barcode_scan_time = 0
    last_deep_barcode_scan_time = 0
    
    # We store the bounding boxes here so they display smoothly even on skipped frames!
    draw_rects = []
    draw_texts = []

    try:
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
                camera.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
                camera.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)
                camera.set(cv2.CAP_PROP_FPS, CAMERA_FPS)
                camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                camera.set(cv2.CAP_PROP_AUTOFOCUS, 1)
                if not camera.isOpened():
                    print("[ERROR] Webcam could not be opened. Retrying in 1 second...")
                    camera.release()
                    camera = None
                    time.sleep(1)
                    continue
                print("[HARDWARE] Webcam ACTIVE and bound to video thread.")

            success, frame = camera.read()
            if not success:
                print("[WARN] Failed to read webcam frame. Reinitializing camera...")
                camera.release()
                camera = None
                time.sleep(0.5)
                continue

            current_time = time.time()
            frame_counter += 1

            # ==========================================
            # AI FRAME SKIPPING (Optimize CPU)
            # Barcode scans need more chances; face matching stays heavier.
            # ==========================================
            process_barcode_frame = (
                current_state == "SCANNING_BARCODE"
                and (current_time - last_barcode_scan_time) >= BARCODE_SCAN_INTERVAL
            )
            process_face_frame = current_state == "VERIFYING_FACE" and frame_counter % FACE_PROCESS_EVERY_N_FRAMES == 0
            process_this_frame = process_barcode_frame or process_face_frame

            if process_this_frame:
                draw_rects = [] # Clear old boxes
                draw_texts = [] # Clear old text

                # ------------------------------------------
                # PHASE 1: BARCODE DETECTION
                # ------------------------------------------
                if current_state == "SCANNING_BARCODE":
                    last_barcode_scan_time = current_time
                    deep_scan = (current_time - last_deep_barcode_scan_time) >= BARCODE_DEEP_SCAN_INTERVAL
                    if deep_scan:
                        last_deep_barcode_scan_time = current_time
                    barcodes = decode_barcodes_robust(frame, deep_scan=deep_scan)
                    
                    for barcode in barcodes:
                        (x, y, w, h) = barcode["rect"]
                        barcode_data = barcode["data"]
                        
                        with state_lock:
                            if current_state != "SCANNING_BARCODE":
                                continue
                            current_state = "PREPARING_FACE"

                        # Save drawing instructions for the video thread
                        draw_rects.append(((x, y), (x + w, y + h), (255, 191, 0)))
                        draw_texts.append((f"ID: {barcode_data}", (x, y - 10), (255, 191, 0)))

                        print(f"\n[PHASE 1] Barcode Scanned: {barcode_data} at {current_location_id}")
                        
                        # Include camera_location_id in MQTT Payload
                        payload = json.dumps({
                            "student_id": barcode_data,
                            "camera_location_id": current_location_id
                        })
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
                                    
                                    with state_lock:
                                        current_state = "VERIFYING_FACE"
                                        verification_start_time = time.time()
                                    draw_rects.clear() # Clear barcode box immediately
                                    draw_texts.clear()
                                else:
                                    print(f"[ERROR] No face encoding found in reference photo for {barcode_data}.")
                                    publish_verification("denied")
                                    with state_lock:
                                        current_state = "SCANNING_BARCODE"
                                    time.sleep(2)
                            except Exception as e:
                                print(f"[ERROR] Could not prepare face verification for {barcode_data}: {e}")
                                publish_verification("denied")
                                with state_lock:
                                    current_state = "SCANNING_BARCODE"
                                time.sleep(2)
                        else:
                            print(f"[ERROR] No reference face image found for {barcode_data}.")
                            publish_verification("denied")
                            with state_lock:
                                current_state = "SCANNING_BARCODE"
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
                        publish_verification("approved")
                        with state_lock:
                            current_state = "SCANNING_BARCODE"
                        time.sleep(2)
                        
                    elif (current_time - verification_start_time) > FACE_MATCH_TIMEOUT:
                        print(f"[FAILED] Match timeout for {target_student_id}")
                        publish_verification("denied")
                        with state_lock:
                            current_state = "SCANNING_BARCODE"
                        time.sleep(2)

            # ==========================================
            # VIDEO RENDERING (Runs EVERY frame for 30fps)
            # ==========================================
            for (pt1, pt2, color) in draw_rects:
                cv2.rectangle(frame, pt1, pt2, color, 3)
            for (text, pt, color) in draw_texts:
                cv2.putText(frame, text, pt, cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY])
            if not ret:
                print("[WARN] Failed to encode webcam frame.")
                continue
            frame_bytes = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    except GeneratorExit:
        print("[STREAM] Browser disconnected from /video_feed.")
    except Exception as e:
        print(f"[FATAL] Vision stream crashed: {e}")
    finally:
        if camera is not None:
            camera.release()
            print("[HARDWARE] Webcam released after stream shutdown.")
        stream_lock.release()
        print("[STREAM] Video stream ownership released.")

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    print("\n=======================================================")
    print("[SYSTEM] Booting AI Edge Node Server on port 5000...")
    print("[SYSTEM] Hardware is currently ASLEEP. Waiting for Guard Portal connection.")
    print("=======================================================\n")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
