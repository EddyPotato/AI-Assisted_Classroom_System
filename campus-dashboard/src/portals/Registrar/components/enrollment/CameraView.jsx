import { Camera, RotateCcw, Lightbulb, Sun, Moon, CheckCircle2 } from 'lucide-react';

export default function CameraView({ 
  isCameraActive, capturedImageUrl, videoRef, canvasRef, brightnessStatus, onStart, onCapture, onRetake 
}) {
  const getBrightnessIndicator = () => {
    if (!isCameraActive) return null;
    if (brightnessStatus === 'dark') return <span className="flex items-center gap-1.5 text-rose-600 font-black"><Moon size={16}/> Too Dark</span>;
    if (brightnessStatus === 'bright') return <span className="flex items-center gap-1.5 text-amber-500 font-black"><Sun size={16}/> Too Bright</span>;
    if (brightnessStatus === 'good') return <span className="flex items-center gap-1.5 text-emerald-600 font-black"><CheckCircle2 size={16}/> Good Lighting</span>;
    return <span className="flex items-center gap-1.5 text-slate-400 font-bold">Checking Light...</span>;
  };

  const isCaptureDisabled = brightnessStatus === 'dark' || brightnessStatus === 'checking';

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="h-6 flex items-center justify-between px-1">
        <h5 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Preview Stream</h5>
        {getBrightnessIndicator()}
      </div>

      {/* THE FIX: Perfectly square aspect ratio container */}
      <div className="relative w-full max-w-sm mx-auto aspect-square bg-slate-900 rounded-3xl overflow-hidden shadow-sm flex items-center justify-center">
        <canvas ref={canvasRef} className="hidden"></canvas>
        
        {!isCameraActive && !capturedImageUrl && (
          <div className="text-center text-slate-600 flex flex-col items-center gap-3">
            <Camera size={48} className="opacity-30" />
            <p className="font-bold text-sm">Camera is offline</p>
          </div>
        )}

        {isCameraActive && (
          <>
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"></video>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[45%] h-[60%] border-2 border-white/70 border-dashed rounded-[40%] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
            </div>
          </>
        )}

        {capturedImageUrl && (
          <img src={capturedImageUrl} alt="Captured face" className="absolute inset-0 w-full h-full object-cover aspect-square" />
        )}
      </div>

      <div className="mt-2 max-w-sm mx-auto w-full">
        {!isCameraActive && !capturedImageUrl && (
          <button type="button" onClick={onStart} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
            <Camera size={18}/> Start Camera
          </button>
        )}
        
        {isCameraActive && (
          <button
            type="button"
            onClick={onCapture}
            disabled={isCaptureDisabled}
            className={`w-full font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${
              isCaptureDisabled
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
            }`}
          >
            <Camera size={18}/> Capture Snapshot
          </button>
        )}

        {capturedImageUrl && (
          <button type="button" onClick={onRetake} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2">
            <RotateCcw size={18}/> Retake Photo
          </button>
        )}
      </div>
    </div>
  );
}