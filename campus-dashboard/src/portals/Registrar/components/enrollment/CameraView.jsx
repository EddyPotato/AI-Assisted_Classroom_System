import { Camera, RotateCcw, Lightbulb, Sun, Moon, CheckCircle2 } from 'lucide-react';

export default function CameraView({ 
  isCameraActive, capturedImageUrl, videoRef, canvasRef, brightnessStatus, onStart, onCapture, onRetake 
}) {

  // Dynamic status UI generator based on brightness math
  const getBrightnessIndicator = () => {
    if (!isCameraActive) return null;
    if (brightnessStatus === 'dark') return <span className="flex items-center gap-1 text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded text-xs"><Moon size={14}/> Too Dark</span>;
    if (brightnessStatus === 'bright') return <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded text-xs"><Sun size={14}/> Too Bright</span>;
    if (brightnessStatus === 'good') return <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded text-xs"><CheckCircle2 size={14}/> Good Lighting</span>;
    return <span className="text-slate-400 text-xs font-bold px-2 py-1">Checking Light...</span>;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* LEFT COLUMN: Camera/Image Display */}
      <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center relative min-h-70">
        <canvas ref={canvasRef} width="320" height="240" className="hidden"></canvas>
        
        {/* Placeholder Box */}
        {!isCameraActive && !capturedImageUrl && (
          <div className="text-center text-slate-400 flex flex-col items-center gap-3">
            <Camera size={48} className="opacity-20" />
            <p className="font-bold text-sm">Camera is inactive.</p>
          </div>
        )}

        {/* Live Video Feed */}
        {isCameraActive && (
          <div className="relative w-full flex justify-center">
            {/* The Video Source */}
            <video ref={videoRef} autoPlay playsInline className="rounded-lg shadow-inner bg-black w-80 h-60 object-cover scale-x-[-1] border border-slate-300"></video>
            
            {/* Overlay Guide Lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-36 h-48 border-2 border-white/60 border-dashed rounded-[40%] shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]"></div>
            </div>
            
            {/* Brightness Indicator Bubble */}
            <div className="absolute top-2 left-2 z-10">
              {getBrightnessIndicator()}
            </div>
          </div>
        )}

        {/* Captured Image Preview */}
        {capturedImageUrl && (
          <div className="relative w-full flex justify-center">
             <img src={capturedImageUrl} alt="Captured face" className="rounded-lg shadow-md w-80 h-60 object-cover border-4 border-slate-200" />
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Tips and Buttons */}
      <div className="col-span-1 flex flex-col gap-4">
        
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex-1">
          <h5 className="font-black text-blue-800 flex items-center gap-2 mb-3 text-sm">
            <Lightbulb size={16} className="text-amber-400 fill-amber-400"/> Photo Guide
          </h5>
          <ul className="text-xs font-medium text-slate-600 space-y-2 list-disc pl-4">
            <li>Ensure the face fills the <strong className="text-slate-800">dashed oval guide</strong>.</li>
            <li>Look directly at the camera.</li>
            <li>Remove <strong className="text-rose-600">glasses</strong>, hats, or masks.</li>
            <li>Ensure the lighting indicator shows <strong className="text-emerald-600">Good Lighting</strong> before capturing.</li>
          </ul>
        </div>

        {/* Dynamic Button Area */}
        <div className="shrink-0">
          {!isCameraActive && !capturedImageUrl && (
            <button type="button" onClick={onStart} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
              <Camera size={18}/> Start Camera
            </button>
          )}

          {isCameraActive && (
            <button type="button" onClick={onCapture} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
              <Camera size={18}/> Capture Snapshot
            </button>
          )}

          {capturedImageUrl && (
            <button type="button" onClick={onRetake} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
              <RotateCcw size={18}/> Retake Photo
            </button>
          )}
        </div>

      </div>
    </div>
  );
}