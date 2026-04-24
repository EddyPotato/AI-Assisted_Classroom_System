import { useState, useRef, useCallback, useEffect } from 'react';
import CameraSelector from './CameraSelector';
import CameraView from './CameraView';

export default function FaceRegistrationCamera({ isOpen, onCapture, onClear }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState(null);
  
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // 1. Fetch available cameras on mount
  useEffect(() => {
    let isMounted = true;
    async function getCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        if (isMounted) {
          setVideoDevices(cameras);
          if (cameras.length > 0) setSelectedDeviceId(cameras[0].deviceId);
        }
      } catch (err) {
        console.error("Could not scan for cameras:", err);
      }
    }
    getCameras();
    return () => { isMounted = false; };
  }, []);

  const stopHardwareCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = async () => {
    stopHardwareCamera(); 
    try {
      const constraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("CAMERA HARDWARE ERROR:", err);
      alert("Error accessing camera! Ensure no other app is using the webcam, and permissions are granted.");
    }
  };

  // 2. THE FIX: Handle device switch WITHOUT triggering setState in the effect
  useEffect(() => {
    let isMounted = true;
    
    const switchStream = async () => {
      // Only swap streams if the camera is already actively running
      if (!isCameraActive || !selectedDeviceId) return;
      
      stopHardwareCamera();
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDeviceId } }
        });
        if (isMounted && videoRef.current) {
          videoRef.current.srcObject = stream;
          // Notice we DO NOT call setIsCameraActive(true) here. 
          // It is already true! No cascading render loop.
        }
      } catch (err) {
        console.error("Error switching camera:", err);
      }
    };

    switchStream();
    return () => { isMounted = false; };
  }, [selectedDeviceId, isCameraActive, stopHardwareCamera]);

  useEffect(() => {
    if (!isOpen) stopHardwareCamera();
    return () => stopHardwareCamera();
  }, [isOpen, stopHardwareCamera]);

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 320, 240);
      
      canvasRef.current.toBlob((blob) => {
        onCapture(blob); 
        setCapturedImageUrl(URL.createObjectURL(blob)); 
        stopHardwareCamera();
        setIsCameraActive(false); // Update state manually upon capture
      }, 'image/jpeg', 0.9);
    }
  };

  const retakePhoto = () => {
    onClear(); 
    setCapturedImageUrl(null);
    startCamera();
  };

  return (
    <div className="mt-6 border-t border-slate-100 pt-6">
       <div className="flex justify-between items-end mb-3">
         <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Face Data Registration</h4>
         
         {!capturedImageUrl && (
           <CameraSelector 
             videoDevices={videoDevices}
             selectedDeviceId={selectedDeviceId}
             onSelectDevice={setSelectedDeviceId}
           />
         )}
       </div>

       <CameraView 
         isCameraActive={isCameraActive}
         capturedImageUrl={capturedImageUrl}
         videoRef={videoRef}
         canvasRef={canvasRef}
         onStart={startCamera}
         onCapture={captureSnapshot}
         onRetake={retakePhoto}
       />
    </div>
  );
}