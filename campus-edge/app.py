import cv2
import time
import json
import os
import glob
import threading
import numpy as np
import paho.mqtt.publish as publish
from flask import Flask, Response, jsonify, request
from flask_cors import CORS

# Import our custom modules
import config
from camera import CameraStream
import vision

app = Flask(__name__)
CORS(app)

# --- GLOBAL STATE ---
class SystemState:
    def __init__(self):
        self.camera_active = False
        self.current_location_id = "CAM-001"
        self.current_state = "SCANNING_BARCODE"
        self.target_student_id = ""
        self.target_face_encoding = None
        self.verification_start_time = 0
        
        # Thread-safe Render Output
        self.latest_rendered_frame = None
        self.frame_lock = threading.Lock()

state = SystemState()
cam_stream = CameraStream()

def publish_verification(status):
    publish.single(
        "campus/door/verified",
        payload=json.dumps({"status": status, "camera_location_id": state.current_location_id}),
        hostname=config.MQTT_BROKER
    )

# --- BACKGROUND AI PROCESSOR ---
def vision_processing_loop():
    frame_counter = 0
    last_barcode_scan_time = 0
    draw_rects = []
    draw_texts = []
    
    while True:
        if not state.camera_active:
            time.sleep(0.5)
            continue
            
        frame = cam_stream.read()
        if frame is None:
            time.sleep(0.05)
            continue

        current_time = time.time()
        frame_counter += 1
        
        process_barcode = (state.current_state == "SCANNING_BARCODE" and (current_time - last_barcode_scan_time) >= config.BARCODE_SCAN_INTERVAL)
        process_face = (state.current_state == "VERIFYING_FACE" and frame_counter % config.FACE_PROCESS_EVERY_N_FRAMES == 0)

        # PHASE 1: BARCODE
        if process_barcode:
            last_barcode_scan_time = current_time
            barcodes = vision.decode_barcodes(frame)
            
            if barcodes:
                draw_rects.clear()
                draw_texts.clear()
                
            for barcode in barcodes:
                x, y, w, h = barcode["rect"]
                barcode_data = barcode["data"]
                
                if state.current_state != "SCANNING_BARCODE": continue
                state.current_state = "PREPARING_FACE"

                draw_rects.append(((x, y), (x + w, y + h), (255, 191, 0)))
                draw_texts.append((f"ID: {barcode_data}", (x, y - 10), (255, 191, 0)))

                print(f"\n[PHASE 1] Barcode Scanned: {barcode_data}")
                payload = json.dumps({"student_id": barcode_data, "camera_location_id": state.current_location_id})
                publish.single("campus/door/scan", payload=payload, hostname=config.MQTT_BROKER)
                
                search_pattern = os.path.join(config.REFERENCE_FACES_DIR, f"*{barcode_data}*.*")
                matching_files = glob.glob(search_pattern)
                
                if matching_files:
                    encoding = vision.encode_face_from_image(matching_files[0])
                    if encoding is not None:
                        state.target_face_encoding = encoding
                        state.target_student_id = barcode_data
                        print("[PHASE 1] Ready. Waiting for backend validation...")
                        
                        # THE FIX: Small delay loop. If the backend detects a duplicate, it hits the /command route
                        # which will change state.current_state to "SCANNING_BARCODE". This loop breaks out early.
                        for _ in range(20): # Up to 2.0 seconds total
                            if state.current_state != "PREPARING_FACE":
                                break
                            time.sleep(0.1)
                            
                        # Only proceed if we weren't aborted!
                        if state.current_state == "PREPARING_FACE":
                            print("[PHASE 1] Validated. Switch to Face Verification.")
                            state.current_state = "VERIFYING_FACE"
                            state.verification_start_time = time.time()
                        else:
                            print(f"[PHASE 1] Aborted backend check for {barcode_data}. Dropping Phase 2.")
                    else:
                        publish_verification("denied")
                        state.current_state = "SCANNING_BARCODE"
                else:
                    publish_verification("denied")
                    state.current_state = "SCANNING_BARCODE"
                break 

        # PHASE 2: FACE
        elif process_face:
            match_result = vision.match_face(frame, state.target_face_encoding, config.STRICT_THRESHOLD)
            draw_rects.clear()
            draw_texts.clear()
            
            if match_result:
                left, top, right, bottom = match_result["rect"]
                if match_result["passed"]:
                    draw_rects.append(((left, top), (right, bottom), (0, 255, 0)))
                    draw_texts.append((f"MATCH: {match_result['confidence']}%", (left, top - 10), (0, 255, 0)))
                    
                    print(f"[SUCCESS] Identity Confirmed for {state.target_student_id}")
                    publish_verification("approved")
                    
                    state.current_state = "SCANNING_BARCODE"
                    time.sleep(2) 
                    draw_rects.clear()
                    draw_texts.clear()
                    
                else:
                    draw_rects.append(((left, top), (right, bottom), (0, 165, 255)))
                    draw_texts.append((f"POOR MATCH: {round(match_result['distance'], 2)}", (left, top - 10), (0, 165, 255)))
                    
            elif (current_time - state.verification_start_time) > config.FACE_MATCH_TIMEOUT:
                print(f"[FAILED] Match timeout for {state.target_student_id}")
                publish_verification("denied")
                
                state.current_state = "SCANNING_BARCODE"
                time.sleep(2)
                draw_rects.clear()
                draw_texts.clear()

        # RENDER VISUALS
        if state.current_state == "VERIFYING_FACE":
            cv2.putText(frame, "BIOMETRIC SCAN IN PROGRESS...", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
        
        for (pt1, pt2, color) in draw_rects:
            cv2.rectangle(frame, pt1, pt2, color, 3)
        for (text, pt, color) in draw_texts:
            cv2.putText(frame, text, pt, cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), config.JPEG_QUALITY])
        if ret:
            with state.frame_lock:
                state.latest_rendered_frame = buffer.tobytes()

        time.sleep(0.01)

threading.Thread(target=vision_processing_loop, daemon=True).start()

# --- FLASK ROUTES ---

# THE FIX: Add a new command route to let the backend safely abort Phase 2
@app.route('/command', methods=['POST'])
def handle_command():
    data = request.get_json(silent=True) or {}
    cmd = data.get("command")
    if cmd == "abort_phase2":
        if state.current_state in ["PREPARING_FACE", "VERIFYING_FACE"]:
            print("\n[SYSTEM] Backend requested abort. Cancelling facial recognition.")
            state.current_state = "SCANNING_BARCODE"
    return jsonify({"status": "success"})


@app.route('/start_camera', methods=['POST'])
def start_camera():
    data = request.get_json(silent=True) or {}
    
    # Check for both C# casing and React casing
    loc_id = data.get("Camera_Location_Id") or data.get("location_id")
    if loc_id:
        state.current_location_id = loc_id
    
    state.camera_active = True
    cam_stream.start()
    return jsonify({"status": "success", "location": state.current_location_id})

@app.route('/stop_camera', methods=['POST'])
def stop_camera():
    state.camera_active = False
    cam_stream.stop()
    return jsonify({"status": "success"})

def stream_generator():
    """Serves frames to React instantly, with a fallback screen to prevent React crash."""
    
    # Create a standby frame so the browser <img> tag never starves and crashes
    blank_frame = np.zeros((config.CAMERA_HEIGHT, config.CAMERA_WIDTH, 3), dtype=np.uint8)
    cv2.putText(blank_frame, "WARMING UP OPTICAL SENSORS...", (50, int(config.CAMERA_HEIGHT/2)), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    _, blank_buffer = cv2.imencode('.jpg', blank_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
    blank_bytes = blank_buffer.tobytes()

    while True:
        with state.frame_lock:
            frame_bytes = state.latest_rendered_frame
            
        # If camera is off, or no frame has been captured yet, send the standby frame!
        if not state.camera_active or frame_bytes is None:
            out_bytes = blank_bytes
        else:
            out_bytes = frame_bytes
            
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + out_bytes + b'\r\n')
        
        time.sleep(0.03)

@app.route('/video_feed')
def video_feed():
    return Response(stream_generator(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    print("\n=======================================================")
    print("[SYSTEM] Booting Modular AI Node on port 5000...")
    print("=======================================================\n")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)