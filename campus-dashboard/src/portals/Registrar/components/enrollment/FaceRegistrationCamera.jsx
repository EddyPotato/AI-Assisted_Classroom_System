import { useState, useRef, useCallback, useEffect } from 'react';
import CameraSelector from './CameraSelector';
import CameraView from './CameraView';

export default function FaceRegistrationCamera({ isOpen, onCapture, onClear }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState(null);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  
  const [brightnessStatus, setBrightnessStatus] = useState('checking');

  // Fetch available cameras on mount
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

  // THE FIX: This function is now PURELY for hardware. 
  // It contains ZERO state updates, completely satisfying ESLint.
  const stopHardwareStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = async () => {
    stopHardwareStream(); 
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true
      });
      
      streamRef.current = stream; 
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      setIsCameraActive(true);
      setBrightnessStatus('checking');
    } catch (err) {
      console.error("CAMERA HARDWARE ERROR:", err); 
      alert("Error accessing camera! Ensure no other app is using the webcam.");
    }
  };

  // Hardware toggle effect
  useEffect(() => {
    let isMounted = true;
    const switchStream = async () => {
      if (!isCameraActive || !selectedDeviceId) return;
      stopHardwareStream();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDeviceId } }
        });
        
        streamRef.current = stream; 
        if (isMounted && videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error switching camera:", err);
      }
    };
    switchStream();
    return () => { isMounted = false; };
  }, [selectedDeviceId, isCameraActive, stopHardwareStream]);

  // Modal close effect (Safe because stopHardwareStream has no setState)
  useEffect(() => {
    if (!isOpen) stopHardwareStream();
    return () => stopHardwareStream();
  }, [isOpen, stopHardwareStream]);

  // Lightweight brightness checker
  useEffect(() => {
    if (!isCameraActive || !videoRef.current) return;
    
    const interval = setInterval(() => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;
      
      const canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 64; 
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 64, 64);
      
      const imageData = ctx.getImageData(0, 0, 64, 64).data;
      let sum = 0;
      for(let i=0; i<imageData.length; i+=4) {
        sum += (imageData[i] + imageData[i+1] + imageData[i+2]) / 3;
      }
      
      const avgBrightness = sum / (64 * 64);
      
      if (avgBrightness < 60) setBrightnessStatus('dark');
      else if (avgBrightness > 220) setBrightnessStatus('bright');
      else setBrightnessStatus('good');

    }, 1000);

    return () => clearInterval(interval);
  }, [isCameraActive]);

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 320, 240);
      canvasRef.current.toBlob((blob) => {
        onCapture(blob); 
        setCapturedImageUrl(URL.createObjectURL(blob)); 
        
        // We safely call state here because it's triggered by a user click, not an effect!
        stopHardwareStream();
        setIsCameraActive(false); 
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
       
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 min-h-10.5">
         <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider shrink-0">Face Data Registration</h4>
         
         <div className={`w-full sm:w-auto transition-opacity duration-200 ${capturedImageUrl ? 'invisible opacity-0' : 'visible opacity-100'}`}>
           <CameraSelector 
             videoDevices={videoDevices} 
             selectedDeviceId={selectedDeviceId} 
             onSelectDevice={setSelectedDeviceId} 
           />
         </div>
       </div>

       <CameraView 
         isCameraActive={isCameraActive}
         capturedImageUrl={capturedImageUrl}
         videoRef={videoRef}
         canvasRef={canvasRef}
         brightnessStatus={brightnessStatus}
         onStart={startCamera}
         onCapture={captureSnapshot}
         onRetake={retakePhoto}
       />
    </div>
  );
}