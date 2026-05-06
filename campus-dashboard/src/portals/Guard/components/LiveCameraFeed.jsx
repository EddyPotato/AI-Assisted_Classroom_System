import { Video, ScanLine, Power, RefreshCw } from 'lucide-react';

export default function LiveCameraFeed({ latestScan, streamStatus, streamToken, onRetry }) {
  const streamUrl = `http://localhost:5000/video_feed?t=${streamToken}`;

  return (
    // FIX: Replaced min-h-[400px] with canonical min-h-100
    <div className="h-full w-full bg-black rounded-3xl border-4 border-slate-800 shadow-xl relative overflow-hidden flex items-center justify-center min-h-100">
      
      {streamStatus === "active" && (
        <img 
          src={streamUrl} 
          alt="Live Feed" 
          className="w-full h-full object-cover transform scale-x-[-1] animate-in fade-in duration-500" 
        />
      )}

      {/* Target Reticle */}
      {streamStatus === "active" && (
        // FIX: Replaced w-[350px] h-[350px] with canonical w-87.5 h-87.5
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-87.5 h-87.5 border-2 rounded-3xl transition-all duration-300 z-20 pointer-events-none ${latestScan?.status === 'scanning' ? 'border-blue-400/50 scale-105' : 'border-white/20'}`}>
            <div className={`absolute -top-2 -left-2 w-10 h-10 border-t-4 border-l-4 rounded-tl-xl transition-colors ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
            <div className={`absolute -top-2 -right-2 w-10 h-10 border-t-4 border-r-4 rounded-tr-xl transition-colors ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
            <div className={`absolute -bottom-2 -left-2 w-10 h-10 border-b-4 border-l-4 rounded-bl-xl transition-colors ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
            <div className={`absolute -bottom-2 -right-2 w-10 h-10 border-b-4 border-r-4 rounded-br-xl transition-colors ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
        </div>
      )}

      {/* Fallback States */}
      {streamStatus !== "active" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900 z-40">
          {streamStatus === "offline" && (
            <>
              <Video className="mb-4 text-slate-600" size={64} />
              <p className="font-black text-2xl tracking-widest uppercase text-white">Camera is Offline</p>
              <p className="text-base mt-2 opacity-70 font-medium">Click "Start Camera" in the controls above.</p>
            </>
          )}
          
          {streamStatus === "loading" && (
            <>
              <Power className="mb-4 animate-pulse text-blue-500" size={64} />
              <p className="font-black text-2xl tracking-widest uppercase text-white">Initializing Hardware...</p>
              <p className="text-base mt-2 opacity-70 font-medium">Warming up optical sensors</p>
            </>
          )}

          {streamStatus === "error" && (
            <>
              <ScanLine className="mb-4 opacity-50 text-rose-500" size={64} />
              <p className="font-black text-2xl tracking-widest uppercase text-white">Connection Failed</p>
              <p className="text-base mt-2 opacity-70 font-medium mb-6">Cannot reach edge node on port 5000.</p>
              <button 
                onClick={onRetry}
                className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black tracking-widest uppercase transition-colors shadow-lg active:scale-95"
              >
                <RefreshCw size={18} /> Retry Connection
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
