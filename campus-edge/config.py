import os

REFERENCE_FACES_DIR = r"C:\Users\EdTech\OneDrive\Desktop\AI-Assisted_Classroom_System\campus-backend\ReferenceFaces"
MQTT_BROKER = "localhost"

# Camera Hardware Settings
CAMERA_INDEX = int(os.environ.get("CAMERA_INDEX", 0))
CAMERA_WIDTH = 960
CAMERA_HEIGHT = 540
CAMERA_FPS = 15

# Vision AI Settings
FACE_MATCH_TIMEOUT = 6.0 
BARCODE_SCAN_INTERVAL = 0.25
FACE_PROCESS_EVERY_N_FRAMES = 4
JPEG_QUALITY = 75
STRICT_THRESHOLD = 0.45