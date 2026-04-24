import { Camera, CheckCircle } from 'lucide-react';

export default function CameraView({ 
  isCameraActive, capturedImageUrl, videoRef, canvasRef, onStart, onCapture, onRetake 
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 p-4 min-h-70">
      <canvas ref={canvasRef} width="320" height="240" className="hidden"></canvas>
      
      {!isCameraActive && !capturedImageUrl && (
        <button type="button" onClick={onStart} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95">
          <Camera size={20}/> Start Web Camera
        </button>
      )}
      
      {isCameraActive && (
        <div className="flex flex-col items-center gap-4">
          <video ref={videoRef} autoPlay playsInline className="rounded-lg shadow-inner bg-black w-80 h-60 object-cover scale-x-[-1]"></video>
          <button type="button" onClick={onCapture} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all active:scale-95 animate-pulse">
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
          <button type="button" onClick={onRetake} className="text-slate-500 hover:text-slate-800 font-bold underline text-sm">
            Retake Photo
          </button>
        </div>
      )}
    </div>
  );
}