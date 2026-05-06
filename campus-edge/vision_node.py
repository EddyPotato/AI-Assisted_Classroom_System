import cv2
import os
import glob
import time
import json
from pyzbar import pyzbar
import paho.mqtt.publish as publish
import face_recognition
from flask import Flask, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Allows the React dashboard to read the video stream

# --- CONFIGURATION ---
# The exact path to your C# backend's face storage
REFERENCE_FACES_DIR = r"C:\Users\EdTech\OneDrive\Desktop\AI-Assisted_Classroom_System\campus-backend\ReferenceFaces"
MQTT_BROKER = "localhost"
FACE_MATCH_TIMEOUT = 6.0 # How many seconds to wait for a face match before denying

camera = cv2.VideoCapture(0)
# Setting a slightly higher resolution for better face mapping
camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

# --- STATE MACHINE VARIABLES ---
current_state = "SCANNING_BARCODE" # States: SCANNING_BARCODE -> VERIFYING_FACE
target_student_id = ""
target_face_encoding = None
verification_start_time = 0

def generate_frames():
    global current_state, target_student_id, target_face_encoding, verification_start_time
    
    while True:
        success, frame = camera.read()
        if not success:
            break
            
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
                            time.sleep(1.5) # Don't instantly flash
                            publish.single("campus/door/verified", payload=json.dumps({"status": "denied"}), hostname=MQTT_BROKER)
                            time.sleep(2)
                    except Exception as e:
                        pass
                else:
                    print(f"[ERROR] No registered photo found for {barcode_data}! Cannot verify face.")
                    time.sleep(2.0) # Wait so the Guard sees the "Missing Face" UI
                    publish.single("campus/door/verified", payload=json.dumps({"status": "denied"}), hostname=MQTT_BROKER)
                    time.sleep(2)

        # ==========================================
        # PHASE 2: FACE RECOGNITION MATCHING
        # ==========================================
        elif current_state == "VERIFYING_FACE":
            # Add UI overlay to the video feed
            cv2.putText(frame, "BIOMETRIC SCAN IN PROGRESS...", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
            
            # Compress frame to 1/4 size for much faster AI processing
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            # Convert OpenCV's BGR color to RGB for face_recognition
            rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
            
            # Find all faces in the live camera feed
            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
            
            match_found = False
            
            for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
                # Scale back up face locations since the frame we detected in was scaled to 1/4 size
                top *= 4; right *= 4; bottom *= 4; left *= 4
                
                # Compare the live face to the target reference encoding
                # tolerance=0.6 is strict. Lower it to 0.5 for tighter security.
                matches = face_recognition.compare_faces([target_face_encoding], face_encoding, tolerance=0.6)
                
                if matches[0]:
                    match_found = True
                    cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 3) # Green Box
                    cv2.putText(frame, "MATCH APPROVED", (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                    break
                else:
                    cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2) # Red Box
                    cv2.putText(frame, "ANALYZING...", (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

            if match_found:
                print(f"[SUCCESS] Identity Confirmed for {target_student_id}")
                publish.single("campus/door/verified", payload=json.dumps({"status": "approved"}), hostname=MQTT_BROKER)
                current_state = "SCANNING_BARCODE"
                time.sleep(2) # Delay to prevent double-scanning
                
            elif (current_time - verification_start_time) > FACE_MATCH_TIMEOUT:
                print(f"[FAILED] Face match timeout for {target_student_id}")
                publish.single("campus/door/verified", payload=json.dumps({"status": "denied"}), hostname=MQTT_BROKER)
                current_state = "SCANNING_BARCODE"
                time.sleep(2)

        # Encode the frame as a JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        # Yield the frame to the Flask web stream
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    print("\n=======================================================")
    print("[SYSTEM] Booting AI Edge Node Server on port 5000...")
    print(f"[SYSTEM] Reference Folder: {REFERENCE_FACES_DIR}")
    print("[INFO] Camera feed is headless. View stream on React Dashboard.")
    print("=======================================================\n")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)