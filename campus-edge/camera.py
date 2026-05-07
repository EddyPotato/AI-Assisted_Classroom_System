import cv2
import time
import threading
from config import CAMERA_INDEX, CAMERA_WIDTH, CAMERA_HEIGHT, CAMERA_FPS

class CameraStream:
    def __init__(self):
        self.camera = None
        self.frame = None
        self.is_running = False
        self.lock = threading.Lock()
        self.thread = None

    def start(self):
        if self.is_running: return
        self.is_running = True
        
        # Initialize hardware safely
        self.camera = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_DSHOW)
        if not self.camera.isOpened():
            print(f"[ERROR] Camera {CAMERA_INDEX} failed. Trying fallback index 1...")
            self.camera = cv2.VideoCapture(1, cv2.CAP_DSHOW)
            
        if self.camera.isOpened():
            self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
            self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)
            self.camera.set(cv2.CAP_PROP_FPS, CAMERA_FPS)
            self.camera.set(cv2.CAP_PROP_BUFFERSIZE, 1) # Crucial to prevent lag
            print("[HARDWARE] Webcam ACTIVE and bound to background thread.")
        else:
            print("[ERROR] Could not open any webcam.")

        self.thread = threading.Thread(target=self._update, daemon=True)
        self.thread.start()

    def stop(self):
        self.is_running = False
        if self.thread is not None:
            self.thread.join()
        if self.camera is not None:
            self.camera.release()
            self.camera = None
        print("[HARDWARE] Webcam released.")

    def _update(self):
        """Constantly pulls the newest frame into memory"""
        while self.is_running:
            if self.camera and self.camera.isOpened():
                success, frame = self.camera.read()
                if success:
                    with self.lock:
                        self.frame = frame
                else:
                    time.sleep(0.01)
            else:
                time.sleep(0.1)

    def read(self):
        """Returns a copy of the latest frame"""
        with self.lock:
            if self.frame is not None:
                return self.frame.copy()
            return None