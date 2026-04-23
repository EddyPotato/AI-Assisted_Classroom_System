import cv2
from pyzbar import pyzbar
import paho.mqtt.publish as publish
import time

def start_edge_node():
    print("[SYSTEM] Booting AI Edge Node...")
    
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    if not cap.isOpened():
        print("[ERROR] Cannot access the camera. Is another app using it?")
        return

    print("[SYSTEM] Camera active. Scanning for Professor/Student Barcodes...")
    print("[INFO] Press 'q' on your keyboard to quit the camera window.")

    # Debounce variables to prevent network spam
    last_scanned_id = ""
    last_scan_time = 0
    COOLDOWN_SECONDS = 5

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        barcodes = pyzbar.decode(frame)
        current_time = time.time()

        for barcode in barcodes:
            (x, y, w, h) = barcode.rect
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

            barcode_data = barcode.data.decode("utf-8")
            text = f"{barcode_data}"
            cv2.putText(frame, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            # Only send to the network if it's a new ID, or if 5 seconds have passed
            if barcode_data != last_scanned_id or (current_time - last_scan_time) > COOLDOWN_SECONDS:
                print(f"[NETWORK] Broadcasting MQTT Message: {barcode_data}")
                
                try:
                    # Send the ID to the 'campus/door/scan' topic on our local broker
                    publish.single("campus/door/scan", payload=barcode_data, hostname="localhost")
                    
                    last_scanned_id = barcode_data
                    last_scan_time = current_time
                except Exception as e:
                    print(f"[ERROR] MQTT Network Failure: {e}")

        cv2.imshow("Smart Campus - Door Camera Feed", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    print("[SYSTEM] Shutting down camera...")
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    start_edge_node()