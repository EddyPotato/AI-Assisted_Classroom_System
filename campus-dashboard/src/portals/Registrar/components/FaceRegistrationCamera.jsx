import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, CheckCircle } from 'lucide-react';

export default function FaceRegistrationCamera({ isOpen, onCapture, onClear }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("CAMERA HARDWARE ERROR:", err);
      alert("Error accessing camera! Ensure no other app is using the webcam, and permissions are granted.");
    }
  };

  const stopHardwareCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const stopCamera = useCallback(() => {
    stopHardwareCamera();
    setIsCameraActive(false);
  }, []);

  // THE FIX: Removed the synchronous state update (setCapturedImageUrl).
  // We only need to shut off the hardware camera tracks. React will automatically
  // handle clearing the local state because the parent unmounts this component.
  useEffect(() => {
    if (!isOpen) stopHardwareCamera();
    
    return () => stopHardwareCamera();
  }, [isOpen]);

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 320, 240);
      
      canvasRef.current.toBlob((blob) => {
        onCapture(blob); 
        setCapturedImageUrl(URL.createObjectURL(blob)); 
        stopCamera();
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
       <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Face Data Registration</h4>
       <div className="flex flex-col items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 p-4 min-h-70">
         <canvas ref={canvasRef} width="320" height="240" className="hidden"></canvas>
         
         {!isCameraActive && !capturedImageUrl && (
            <button type="button" onClick={startCamera} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95">
              <Camera size={20}/> Start Web Camera
            </button>
         )}
         
         {isCameraActive && (
            <div className="flex flex-col items-center gap-4">
              <video ref={videoRef} autoPlay playsInline className="rounded-lg shadow-inner bg-black w-80 h-60 object-cover scale-x-[-1]"></video>
              <button type="button" onClick={captureSnapshot} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all active:scale-95 animate-pulse">
                Capture Snapshot
              </button>
            </div>
         )}
         
         {capturedImageUrl && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img src={capturedImageUrl} alt="Captured face" className="rounded-lg shadow-md w-80 h-60 object-cover" />
                <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full"><CheckCircle size={20}/></div>
              </div>
              <button type="button" onClick={retakePhoto} className="text-slate-500 hover:text-slate-800 font-bold underline text-sm">Retake Photo</button>
            </div>
         )}
       </div>
    </div>
  );
}