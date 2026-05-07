import { Video, ScanLine, Power, RefreshCw } from 'lucide-react';

export default function LiveCameraFeed({ latestScan, streamStatus, streamToken, onRetry, onStreamDrop }) {
  const streamUrl = `http://localhost:5000/video_feed?t=${streamToken}`;

  return (
    <div className="w-full max-w-xl aspect-square lg:h-full lg:w-auto lg:max-h-full lg:max-w-full bg-black rounded-3xl sm:rounded-[2.5rem] border-4 border-slate-800 shadow-xl relative overflow-hidden flex items-center justify-center">
      
      {streamStatus === "active" && (
        <img 
          src={streamUrl} 
          alt="Live Feed" 
          className="w-full h-full object-cover transform scale-x-[-1] animate-in fade-in duration-500" 
          onError={onStreamDrop}
        />
      )}

      {/* Target Reticle (Responsive Square) */}
      {streamStatus === "active" && (
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 aspect-square max-w-xs max-h-xs border-2 rounded-3xl transition-all duration-300 z-20 pointer-events-none ${latestScan?.status === 'scanning' ? 'border-blue-400/50 scale-105' : 'border-white/20'}`}>
            <div className={`absolute -top-2 -left-2 w-10 h-10 border-t-4 border-l-4 rounded-tl-2xl transition-colors ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
            <div className={`absolute -top-2 -right-2 w-10 h-10 border-t-4 border-r-4 rounded-tr-2xl transition-colors ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
            <div className={`absolute -bottom-2 -left-2 w-10 h-10 border-b-4 border-l-4 rounded-bl-2xl transition-colors ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
            <div className={`absolute -bottom-2 -right-2 w-10 h-10 border-b-4 border-r-4 rounded-br-2xl transition-colors ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
        </div>
      )}

      {/* Fallback States */}
      {streamStatus !== "active" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900 z-40 p-6 text-center">
          {streamStatus === "offline" && (
            <>
              <Video className="mb-4 text-slate-600 w-14 h-14 lg:w-20 lg:h-20" />
              <p className="font-black text-xl sm:text-2xl lg:text-3xl tracking-widest uppercase text-white">Camera Offline</p>
              <p className="text-sm sm:text-base lg:text-lg mt-2 opacity-70 font-medium">Click "Start Camera" to begin.</p>
            </>
          )}
          
          {streamStatus === "loading" && (
            <>
              <Power className="mb-4 animate-pulse text-blue-500 w-14 h-14 lg:w-20 lg:h-20" />
              <p className="font-black text-xl sm:text-2xl lg:text-3xl tracking-widest uppercase text-white">Initializing...</p>
              <p className="text-sm sm:text-base lg:text-lg mt-2 opacity-70 font-medium">Warming up optical sensors</p>
            </>
          )}

          {streamStatus === "error" && (
            <>
              <ScanLine className="mb-4 opacity-50 text-rose-500 w-14 h-14 lg:w-20 lg:h-20" />
              <p className="font-black text-xl sm:text-2xl lg:text-3xl tracking-widest uppercase text-white">Connection Failed</p>
              <p className="text-sm sm:text-base lg:text-lg mt-2 opacity-70 font-medium mb-5 lg:mb-8">Cannot reach edge node on port 5000.</p>
              <button 
                onClick={onRetry}
                className="flex items-center gap-2 px-5 sm:px-8 py-3 sm:py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black tracking-widest uppercase transition-colors shadow-lg active:scale-95 text-sm sm:text-base"
              >
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" /> Retry Connection
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
