import cv2
from pyzbar import pyzbar
import paho.mqtt.publish as publish
import time
from flask import Flask, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Allows the React dashboard to read the video stream

camera = cv2.VideoCapture(0)
camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

last_scanned_id = ""
last_scan_time = 0
COOLDOWN_SECONDS = 5

def generate_frames():
    global last_scanned_id, last_scan_time
    
    while True:
        success, frame = camera.read()
        if not success:
            break
            
        barcodes = pyzbar.decode(frame)
        current_time = time.time()

        for barcode in barcodes:
            (x, y, w, h) = barcode.rect
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

            barcode_data = barcode.data.decode("utf-8")
            cv2.putText(frame, f"{barcode_data}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            # MQTT Broadcast Logic
            if barcode_data != last_scanned_id or (current_time - last_scan_time) > COOLDOWN_SECONDS:
                print(f"[NETWORK] Broadcasting MQTT Message: {barcode_data}")
                try:
                    publish.single("campus/door/scan", payload=barcode_data, hostname="localhost")
                    last_scanned_id = barcode_data
                    last_scan_time = current_time
                except Exception as e:
                    print(f"[ERROR] MQTT Failure: {e}")

        # Encode the frame as a JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        # Yield the frame to the Flask web stream
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# This is the URL endpoint React will use to get the video
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    print("[SYSTEM] Booting AI Edge Node Server on port 5000...")
    print("[INFO] Camera feed is now headless. View the stream on your React Dashboard.")
    # Run the Flask server locally
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)