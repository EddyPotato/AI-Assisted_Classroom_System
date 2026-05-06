import { Video, ScanLine, RefreshCw, Power } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LiveCameraFeed({ latestScan }) {
  const [streamStatus, setStreamStatus] = useState("loading"); // loading, active, error
  const [streamUrl, setStreamUrl] = useState("");

  useEffect(() => {
    let isMounted = true;

    const initCamera = async () => {
      try {
        // 1. Tell Python to physically turn ON the webcam
        const response = await fetch("http://localhost:5000/start_camera", { method: 'POST' });
        
        if (response.ok && isMounted) {
          // 2. Wait 1 second for the hardware to warm up, then request the video feed
          setTimeout(() => {
            if (isMounted) {
              setStreamUrl(`http://localhost:5000/video_feed?t=${Date.now()}`);
              setStreamStatus("active");
            }
          }, 1000);
        } else {
          if (isMounted) setStreamStatus("error");
        }
      } catch (err) {
        console.error("Camera API not reachable:", err);
        if (isMounted) setStreamStatus("error");
      }
    };

    initCamera();

    // 3. CLEANUP: When Guard leaves the page, turn OFF the physical webcam!
    return () => {
      isMounted = false;
      // keepalive: true ensures the signal sends even if the browser tab is closing
      fetch("http://localhost:5000/stop_camera", { method: 'POST', keepalive: true }).catch(() => {});
    };
  }, []);

  const handleRetry = () => {
    setStreamStatus("loading");
    fetch("http://localhost:5000/start_camera", { method: 'POST' })
      .then(() => {
        setTimeout(() => {
          setStreamUrl(`http://localhost:5000/video_feed?t=${Date.now()}`);
          setStreamStatus("active");
        }, 1000);
      })
      .catch(() => setStreamStatus("error"));
  };

  return (
    <div className="flex-1 bg-black rounded-3xl border-4 border-slate-800 shadow-2xl relative overflow-hidden flex items-center justify-center h-full min-h-[60vh]">
      
      {streamStatus === "active" && (
        <img 
          src={streamUrl} 
          alt="Live Feed" 
          className="w-full h-full object-cover transform scale-x-[-1]" 
          onError={() => setStreamStatus("error")} 
        />
      )}

      {/* Overlay Information */}
      <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur text-white px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2 z-30">
        <Video className={`size-5 ${streamStatus === 'active' ? 'text-blue-400' : 'text-slate-500'}`} /> 
        <span className="text-xs font-black tracking-widest uppercase">Main Gate Cam</span>
      </div>
      
      {/* Central Targeting Reticle */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 border-2 rounded-3xl transition-all duration-300 z-20 ${latestScan?.status === 'scanning' ? 'border-blue-400/50 scale-105' : 'border-white/20'}`}>
          <div className={`absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 rounded-tl-xl transition-colors ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
          <div className={`absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 rounded-tr-xl transition-colors ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
          <div className={`absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 rounded-bl-xl transition-colors ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
          <div className={`absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 rounded-br-xl transition-colors ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
      </div>
      
      {/* Fallback UI when stream fails or is loading */}
      {streamStatus !== "active" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900 z-40">
          {streamStatus === "loading" ? (
            <>
              <Power className="mb-4 animate-pulse text-blue-500" size={64} />
              <p className="font-black text-2xl tracking-widest uppercase text-white">Initializing Hardware...</p>
              <p className="text-base mt-2 opacity-70 font-medium">Warming up optical sensors</p>
            </>
          ) : (
            <>
              <ScanLine size={64} className="mb-4 animate-pulse opacity-50 text-slate-500" />
              <p className="font-black text-2xl tracking-widest uppercase text-white">Camera Feed Offline</p>
              <p className="text-base mt-2 opacity-70 font-medium mb-6">Start vision_node.py on port 5000</p>
              
              <button 
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black tracking-widest uppercase transition-colors shadow-lg active:scale-95"
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