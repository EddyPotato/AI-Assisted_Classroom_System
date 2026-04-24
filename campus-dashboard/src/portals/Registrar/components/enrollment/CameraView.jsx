import { Camera, RotateCcw, Lightbulb, Sun, Moon, CheckCircle2 } from 'lucide-react';

export default function CameraView({ 
  isCameraActive, capturedImageUrl, videoRef, canvasRef, brightnessStatus, onStart, onCapture, onRetake 
}) {

  // Dynamic status UI generator
  const getBrightnessIndicator = () => {
    if (!isCameraActive) return null;
    if (brightnessStatus === 'dark') return <span className="flex items-center gap-1.5 text-rose-600 font-black"><Moon size={16}/> Too Dark</span>;
    if (brightnessStatus === 'bright') return <span className="flex items-center gap-1.5 text-amber-500 font-black"><Sun size={16}/> Too Bright</span>;
    if (brightnessStatus === 'good') return <span className="flex items-center gap-1.5 text-emerald-600 font-black"><CheckCircle2 size={16}/> Good Lighting</span>;
    return <span className="flex items-center gap-1.5 text-slate-400 font-bold">Checking Light...</span>;
  };

  // Logic to disable the capture button
  const isCaptureDisabled = brightnessStatus === 'dark' || brightnessStatus === 'checking';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
      
      {/* LEFT COLUMN: Camera Feed & Action Buttons */}
      <div className="col-span-2 flex flex-col gap-3">
        
        {/* Top Indicator Area */}
        <div className="h-6 flex items-center justify-between px-1">
          <h5 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Preview Stream</h5>
          {getBrightnessIndicator()}
        </div>

        {/* Sleek, borderless video container */}
        <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center">
          <canvas ref={canvasRef} width="320" height="240" className="hidden"></canvas>
          
          {/* Placeholder Box */}
          {!isCameraActive && !capturedImageUrl && (
            <div className="text-center text-slate-600 flex flex-col items-center gap-3">
              <Camera size={48} className="opacity-30" />
              <p className="font-bold text-sm">Camera is offline</p>
            </div>
          )}

          {/* Live Video Feed */}
          {isCameraActive && (
            <>
              {/* Full bleed video */}
              <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"></video>
              
              {/* Overlay Guide Lines (Vignette shadow) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[40%] h-[75%] border-2 border-white/70 border-dashed rounded-[40%] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
              </div>
            </>
          )}

          {/* Captured Image Preview */}
          {capturedImageUrl && (
            <img src={capturedImageUrl} alt="Captured face" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>

        {/* --- MOVED ACTION BUTTONS HERE --- */}
        <div className="mt-1">
          {!isCameraActive && !capturedImageUrl && (
            <button type="button" onClick={onStart} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
              <Camera size={18}/> Start Camera
            </button>
          )}

          {isCameraActive && (
            <button 
              type="button" 
              onClick={onCapture} 
              disabled={isCaptureDisabled}
              className={`w-full font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                isCaptureDisabled 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-primary-600 hover:bg-primary-700 text-white active:scale-95'
              }`}
            >
              <Camera size={18}/> Capture Snapshot
            </button>
          )}

          {capturedImageUrl && (
            <button type="button" onClick={onRetake} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
              <RotateCcw size={18}/> Retake Photo
            </button>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Photo Guide Box */}
      <div className="col-span-1 flex flex-col pt-9"> {/* align-top spacing */}
        <div className="bg-primary-50/50 border border-primary-100 rounded-2xl p-5 flex-1">
          <h5 className="font-black text-primary-800 flex items-center gap-2 mb-4 text-sm">
            <Lightbulb size={18} className="text-amber-400 fill-amber-400"/> Photo Guide
          </h5>
          <ul className="text-sm font-medium text-slate-600 space-y-3 list-disc pl-4">
            <li>Ensure the face fills the <strong className="text-slate-800">dashed oval guide</strong>.</li>
            <li>Look directly at the camera.</li>
            <li>Remove <strong className="text-rose-600">glasses</strong>, hats, or masks.</li>
            <li>Ensure the lighting indicates <strong className="text-emerald-600">Good Lighting</strong>.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}