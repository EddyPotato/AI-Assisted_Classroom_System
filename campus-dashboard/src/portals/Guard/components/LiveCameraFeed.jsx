import { Video, ScanLine, Power, RefreshCw } from 'lucide-react';

export default function LiveCameraFeed({ streamStatus, streamToken, onRetry, onStreamDrop }) {
  const streamUrl = `http://localhost:5000/video_feed?t=${streamToken}`;

  return (
    <div className="w-full max-w-xl aspect-square lg:h-full lg:w-auto lg:max-h-full lg:max-w-full bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden flex items-center justify-center">
      
      {streamStatus === "active" && (
        <img 
          src={streamUrl} 
          alt="Live Feed" 
          className="w-full h-full object-cover animate-in fade-in duration-500" 
          onError={onStreamDrop}
        />
      )}

      {/* Fallback States - Now in Light Mode */}
      {streamStatus !== "active" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-50 z-40 p-6 text-center">
          {streamStatus === "offline" && (
            <>
              <Video className="mb-4 text-slate-300 w-14 h-14 lg:w-20 lg:h-20" />
              <p className="font-black text-xl sm:text-2xl lg:text-3xl tracking-widest uppercase text-slate-800">Camera Offline</p>
              <p className="text-sm sm:text-base lg:text-lg mt-2 font-medium">Click "Start Camera" to begin.</p>
            </>
          )}
          
          {streamStatus === "loading" && (
            <>
              <Power className="mb-4 animate-pulse text-blue-500 w-14 h-14 lg:w-20 lg:h-20" />
              <p className="font-black text-xl sm:text-2xl lg:text-3xl tracking-widest uppercase text-slate-800">Initializing...</p>
              <p className="text-sm sm:text-base lg:text-lg mt-2 font-medium text-slate-500">Warming up optical sensors</p>
            </>
          )}

          {streamStatus === "error" && (
            <>
              <ScanLine className="mb-4 opacity-50 text-rose-500 w-14 h-14 lg:w-20 lg:h-20" />
              <p className="font-black text-xl sm:text-2xl lg:text-3xl tracking-widest uppercase text-slate-800">Connection Failed</p>
              <p className="text-sm sm:text-base lg:text-lg mt-2 font-medium text-slate-500 mb-5 lg:mb-8">Cannot reach edge node on port 5000.</p>
              <button 
                onClick={onRetry}
                className="flex items-center gap-2 px-5 sm:px-8 py-3 sm:py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black tracking-widest uppercase transition-colors shadow-sm active:scale-95 text-sm sm:text-base"
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