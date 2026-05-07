import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HubConnectionBuilder } from "@microsoft/signalr";

import GuardHeader from './components/GuardHeader';
import LiveMonitorView from './views/LiveMonitorView';
import AccessHistory from './components/AccessHistory';

export default function GuardPortal() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('campus_user') || 'null');

  // --- Core State ---
  const [activeTab, setActiveTab] = useState('live'); 
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [accessLog, setAccessLog] = useState([]);
  const [cacheBuster] = useState(() => Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Camera & Location State ---
  const [locations, setLocations] = useState([]);
  const [currentLocationId, setCurrentLocationId] = useState("");
  const [streamStatus, setStreamStatus] = useState("offline"); 
  const [streamToken, setStreamToken] = useState(() => Date.now());
  const [hardwareIndex, setHardwareIndex] = useState(0);
  const [videoDevices, setVideoDevices] = useState([{ index: 0, label: 'System Default Camera' }]);

  // Fetch Locations
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

  // Fetch Hardware Devices
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

  // SignalR Websocket Connection
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

  // Camera API Handlers
  const handleStartCamera = async (locId = currentLocationId, hwIndex = hardwareIndex) => {
    setStreamStatus("loading");
    try {
      const res = await fetch("http://localhost:5106/api/camera/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Camera_Location_Id: locId, Hardware_Index: hwIndex })
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

  const handleLogout = () => {
    if (streamStatus === 'active') handleStopCamera(); 
    navigate('/login', { replace: true });
  };

  const latestScan = accessLog.length > 0 ? accessLog[0] : null;

  return (
    <div className="h-screen flex flex-col font-sans overflow-hidden bg-slate-50 text-slate-900">
      
      {!isFullscreen && (
        <GuardHeader 
          user={user} 
          connectionStatus={connectionStatus} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout} 
        />
      )}

      <main className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ${isFullscreen ? 'p-3 sm:p-5' : 'p-4 sm:p-6'}`}>
        
        {activeTab === 'live' && (
          <LiveMonitorView 
            isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen}
            streamStatus={streamStatus} setStreamStatus={setStreamStatus} streamToken={streamToken}
            handleStartCamera={handleStartCamera} handleStopCamera={handleStopCamera}
            locations={locations} currentLocationId={currentLocationId} setCurrentLocationId={setCurrentLocationId}
            hardwareIndex={hardwareIndex} setHardwareIndex={setHardwareIndex} videoDevices={videoDevices}
            latestScan={latestScan} cacheBuster={cacheBuster}
          />
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