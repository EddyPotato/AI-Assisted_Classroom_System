import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);

  // USE REF: This allows SignalR to read the current location without restarting the socket!
  const currentLocationRef = useRef(currentLocationId);
  useEffect(() => {
    currentLocationRef.current = currentLocationId;
  }, [currentLocationId]);

  // Fetch Locations (From C# Backend)
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

  // Fetch Hardware Devices (Local Browser)
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

  // SignalR Websocket Connection (Runs exactly ONCE on mount)
  useEffect(() => {
    let isMounted = true;
    const newConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5106/campushub")
      .withAutomaticReconnect()
      .build();

    let startPromise = newConnection.start()
      .then(() => isMounted && setConnectionStatus('connected'))
      .catch(() => isMounted && setConnectionStatus('disconnected'));

    const handleLog = (data) => {
      if (!isMounted) return;
      // Use the REF here instead of the state variable to prevent socket drops
      if (data.location_id === currentLocationRef.current) {
        setAccessLog(prev => [data, ...prev.filter(log => log.status !== 'scanning' && log.status !== 'missing_face')]);
      }
    };

    newConnection.on("ReceiveBarcode", handleLog);
    newConnection.on("receivebarcode", handleLog); 
    newConnection.on("ReceiveScanResult", handleLog);
    newConnection.on("receivescanresult", handleLog); 

    return () => { 
      isMounted = false; 
      startPromise.then(() => newConnection.stop()); 
    };
  }, []); // <--- Empty dependency array stops the console errors!

  // Camera API Handlers (Pointing directly to Python Edge Node on Port 5000!)
  // Using useCallback to prevent stale closures on retry
  const handleStartCamera = useCallback(async (locId, hwIndex) => {
    // Use provided values or current state values
    const location = locId || currentLocationId;
    const hardware = hwIndex !== undefined ? hwIndex : hardwareIndex;
    
    if (!location) {
      console.warn("No location selected");
      setStreamStatus("error");
      return;
    }
    
    setStreamStatus("loading");
    setRetryCount(prev => prev + 1);
    
    try {
      const res = await fetch("http://localhost:5000/start_camera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location_id: location, Hardware_Index: hardware })
      });
      
      if (res.ok) {
        setTimeout(() => {
          setStreamToken(Date.now());
          setStreamStatus("active");
          setRetryCount(0); // Reset retry count on success
        }, 1500); 
      } else {
        console.error(`Start camera failed with status: ${res.status}`);
        setStreamStatus("error");
      }
    } catch (err) {
      console.error("Failed to connect to edge node:", err);
      setStreamStatus("error");
    }
  }, [currentLocationId, hardwareIndex]);

  const handleStopCamera = useCallback(async () => {
    try {
      await fetch("http://localhost:5000/stop_camera", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      setStreamStatus("offline");
    } catch (err) {
      console.error("Failed to stop camera:", err);
      setStreamStatus("offline");
    }
  }, []);

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
            latestScan={latestScan} cacheBuster={cacheBuster} retryCount={retryCount}
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