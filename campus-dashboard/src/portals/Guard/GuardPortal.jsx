import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, LayoutDashboard, History } from 'lucide-react';
import { HubConnectionBuilder } from "@microsoft/signalr";

import CameraControls from './components/CameraControls';
import VerificationPanel from './components/VerificationPanel';
import AccessHistory from './components/AccessHistory';
import LiveCameraFeed from './components/LiveCameraFeed';

export default function GuardPortal() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('campus_user') || 'null');

  // --- Core State ---
  const [activeTab, setActiveTab] = useState('live'); 
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [accessLog, setAccessLog] = useState([]);
  const [cacheBuster] = useState(() => Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false); // NEW STATE

  // --- Camera & Location State ---
  const [locations, setLocations] = useState([]);
  const [currentLocationId, setCurrentLocationId] = useState("");
  const [streamStatus, setStreamStatus] = useState("offline"); 
  const [streamToken, setStreamToken] = useState(() => Date.now());
  const [hardwareIndex, setHardwareIndex] = useState(0);
  const [videoDevices, setVideoDevices] = useState([{ index: 0, label: 'System Default Camera' }]);

  useEffect(() => {
    let isMounted = true;
    const fetchLocations = async () => {
      try {
        const res = await fetch('http://localhost:5106/api/camera/locations');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setLocations(data);
            if (data.length > 0) setCurrentLocationId(data[0].location_ID);
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchLocations();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const getCameras = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true }).then(stream => stream.getTracks().forEach(t => t.stop())).catch(() => {});
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        if (isMounted && cameras.length > 0) {
          setVideoDevices(cameras.map((cam, idx) => ({ index: idx, label: cam.label || `System Camera ${idx + 1}` })));
        }
      } catch (err) { console.error(err); }
    };
    getCameras();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const newConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5106/campushub")
      .withAutomaticReconnect()
      .build();

    newConnection.start()
      .then(() => isMounted && setConnectionStatus('connected'))
      .catch(() => isMounted && setConnectionStatus('disconnected'));

    const handleLog = (data) => {
      if (!isMounted) return;
      if (data.location_id === currentLocationId) {
        setAccessLog(prev => [data, ...prev.filter(log => log.status !== 'scanning' && log.status !== 'missing_face')]);
      }
    };

    newConnection.on("ReceiveBarcode", handleLog);
    newConnection.on("receivebarcode", handleLog); 
    newConnection.on("ReceiveScanResult", handleLog);
    newConnection.on("receivescanresult", handleLog); 

    return () => { isMounted = false; newConnection.stop(); };
  }, [currentLocationId]);

  const handleStartCamera = async () => {
    setStreamStatus("loading");
    try {
      const res = await fetch("http://localhost:5106/api/camera/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Camera_Location_Id: currentLocationId, Hardware_Index: hardwareIndex })
      });
      if (res.ok) {
        setTimeout(() => {
          setStreamToken(Date.now());
          setStreamStatus("active");
        }, 1500); 
      } else setStreamStatus("error");
    } catch { setStreamStatus("error"); }
  };

  const handleStopCamera = async () => {
    try {
      await fetch("http://localhost:5106/api/camera/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Camera_Location_Id: currentLocationId })
      });
      setStreamStatus("offline");
    } catch { console.error("Failed to stop camera."); }
  };

  const latestScan = accessLog.length > 0 ? accessLog[0] : null;

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden transition-colors duration-300 ${isFullscreen ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* GLOBAL HEADER - HIDDEN IN FULLSCREEN */}
      {!isFullscreen && (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-blue-600" size={28} />
              <h1 className="text-xl font-black text-slate-800 tracking-tight hidden sm:block">Campus Security</h1>
              <span className={`ml-2 px-3 py-1 rounded-lg text-[10px] uppercase font-black border flex items-center gap-2 ${connectionStatus === 'connected' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                {connectionStatus === 'connected' ? 'System Live' : 'Offline'}
              </span>
            </div>
            <div className="hidden md:flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setActiveTab('live')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'live' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutDashboard size={16} /> Live Monitor
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <History size={16} /> Access History
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{user?.First_Name || user?.first_Name || 'Campus'} {user?.Last_Name || user?.last_Name || 'Guard'}</p>
              <p className="text-xs font-bold text-slate-500 uppercase">Station Duty</p>
            </div>
            <button 
              onClick={() => {
                if (streamStatus === 'active') handleStopCamera(); 
                navigate('/login', { replace: true });
              }} 
              className="bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 p-2.5 rounded-lg transition-colors border border-slate-200 shadow-sm active:scale-95"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
      )}

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ${isFullscreen ? 'p-3 sm:p-5' : 'p-4 sm:p-6'}`}>
        
        {activeTab === 'live' && (
          <div className={`min-h-full lg:h-full flex flex-col gap-4 mx-auto animate-in fade-in duration-300 ${isFullscreen ? 'max-w-[100rem]' : 'max-w-7xl sm:gap-6'}`}>
            
            <CameraControls 
              streamStatus={streamStatus}
              onStart={handleStartCamera}
              onStop={handleStopCamera}
              locations={locations}
              currentLocationId={currentLocationId}
              onLocationChange={setCurrentLocationId}
              hardwareIndex={hardwareIndex}
              onHardwareIndexChange={setHardwareIndex}
              videoDevices={videoDevices} 
              isFullscreen={isFullscreen}
              toggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-stretch justify-center gap-4 sm:gap-6 min-h-0 w-full">
              <div className="min-h-0 w-full flex justify-center items-center">
                <LiveCameraFeed 
                  streamStatus={streamStatus}
                  streamToken={streamToken}
                  onRetry={handleStartCamera} 
                  onStreamDrop={() => setStreamStatus("error")}
                />
              </div>

              <div className="min-h-0 w-full flex justify-center items-center">
                <VerificationPanel latestScan={latestScan} cacheBuster={cacheBuster} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && !isFullscreen && (
          <div className="h-full max-w-3xl mx-auto">
            <AccessHistory logs={accessLog.filter(log => log.status !== 'scanning')} />
          </div>
        )}

      </main>
    </div>
  );
}