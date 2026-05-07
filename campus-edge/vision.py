import cv2
import face_recognition
from pyzbar import pyzbar

def decode_barcodes(frame):
    """Lightweight Grayscale Barcode Scanner"""
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    results = []
    seen = set()
    
    for barcode in pyzbar.decode(gray_frame):
        barcode_data = barcode.data.decode("utf-8", errors="ignore").strip()
        if barcode_data and barcode_data not in seen:
            seen.add(barcode_data)
            x, y, w, h = barcode.rect
            results.append({
                "data": barcode_data,
                "rect": (int(x), int(y), int(w), int(h))
            })
    return results

def encode_face_from_image(image_path):
    """Loads an image and returns the 128D encoding"""
    try:
        ref_image = face_recognition.load_image_file(image_path)
        encodings = face_recognition.face_encodings(ref_image, num_jitters=10)
        if encodings:
            return encodings[0]
    except Exception as e:
        print(f"[ERROR] Could not encode face: {e}")
    return None

def match_face(frame, target_encoding, strict_threshold):
    """Finds faces in a frame and checks against target"""
    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
    
    face_locations = face_recognition.face_locations(rgb_small_frame)
    face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
    
    best_match = None
    best_distance = 1.0
    
    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        top *= 4; right *= 4; bottom *= 4; left *= 4
        distances = face_recognition.face_distance([target_encoding], face_encoding)
        match_distance = distances[0]
        
        if match_distance < best_distance:
            best_distance = match_distance
            best_match = {
                "rect": (left, top, right, bottom),
                "distance": match_distance,
                "passed": match_distance <= strict_threshold,
                "confidence": round((1.0 - match_distance) * 100, 1)
            }
            
    return best_match