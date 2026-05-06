import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, ScanLine, UserCheck, Video, AlertCircle, CheckCircle2, Unlock, ShieldAlert } from 'lucide-react';
import { HubConnectionBuilder } from "@microsoft/signalr";

// The modular Log Entry Component for the sidebar
function AccessLogEntry({ entry }) {
  // Lock the timestamp in state so it doesn't change on every render (React strict mode fix)
  const [cacheBuster] = useState(() => Date.now());
  
  const isApproved = entry.status === "approved" || entry.status === "Access Granted";
  const isBypass = entry.bypass_reason !== null && entry.bypass_reason !== undefined;

  return (
    <div className={`p-3 rounded-xl border transition-all ${
      isBypass 
        ? 'bg-amber-900/30 border-amber-600/50'
        : isApproved 
          ? 'bg-emerald-900/30 border-emerald-600/50'
          : 'bg-rose-900/30 border-rose-600/50'
    }`}>
      <div className="flex items-center gap-3">
        {/* STUDENT PHOTO */}
        {entry.face_reference_path ? (
          <img 
            src={`http://localhost:5106/ReferenceFaces/${entry.face_reference_path}?t=${cacheBuster}`}
            alt={entry.first_name}
            className="w-10 h-10 rounded-full object-cover border border-slate-600 shrink-0"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-400 shrink-0"
          style={{ display: entry.face_reference_path ? 'none' : 'flex' }}
        >
          ?
        </div>

        {/* NAME & ID */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate">
            {entry.first_name} {entry.last_name}
          </p>
          <p className="text-xs text-slate-400 truncate">{entry.student_id}</p>
        </div>

        {/* STATUS BADGE */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[10px] font-black px-2 py-1 rounded whitespace-nowrap ${
            isBypass
              ? 'bg-amber-600 text-white'
              : isApproved
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
          }`}>
            {isBypass ? '⚠️ BYPASS' : isApproved ? '✅ APPROVED' : '❌ DENIED'}
          </span>
          <span className="text-[10px] text-slate-500 font-bold">{entry.timestamp}</span>
        </div>
      </div>

      {/* BYPASS REASON (if applicable) */}
      {isBypass && (
        <p className="text-xs text-amber-400 mt-2 font-medium bg-amber-950/50 p-2 rounded-lg border border-amber-900/50">
          Override Reason: {entry.bypass_reason}
        </p>
      )}
    </div>
  );
}

export default function GuardPortal() {
  const navigate = useNavigate();
  const [accessLog, setAccessLog] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [bypassModal, setBypassModal] = useState(false);
  const [bypassForm, setBypassForm] = useState({ student_id: '', reason: '' });
  
  // Cachebuster state for the main portal view
  const [cacheBuster] = useState(() => Date.now());

  const userString = localStorage.getItem('campus_user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('campus_user');
    navigate('/login', { replace: true });
  };

  // SignalR Real-Time Connection Setup
  useEffect(() => {
    let isMounted = true;
    
    const newConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5106/campushub")
      .withAutomaticReconnect([0, 2000, 5000, 10000]) // Custom retry intervals
      .build();

    async function startSignalR() {
      try {
        await newConnection.start();
        if (isMounted) setConnectionStatus('connected');
        console.log("✅ SignalR connected to CampusHub");
      } catch (err) {
        if (isMounted) setConnectionStatus('disconnected');
        console.error("❌ SignalR connection failed:", err);
      }
    }

    startSignalR();

    // 1. PHASE 1 LISTENER: Barcode Detected, Waiting for Face
    const handleBarcode = (data) => {
      console.log("🔔 Barcode scanned, awaiting face...", data);
      if (isMounted) {
        // Set it as the latest scan, but remove any existing scanning placeholders
        setAccessLog(prev => [data, ...prev.filter(log => log.status !== 'scanning')]);
      }
    };

    // 2. PHASE 2 LISTENER: Face Verified, Final Result
    const handleResult = (data) => {
      console.log("✅ Final result received:", data);
      if (isMounted) {
        // Remove the 'scanning' placeholder and add the final permanent log
        setAccessLog(prev => [data, ...prev.filter(log => log.status !== 'scanning')].slice(0, 50));
      }
    };

    // Attach listeners (with case-insensitive fallbacks for .NET quirks)
    newConnection.on("ReceiveBarcode", handleBarcode);
    newConnection.on("receivebarcode", handleBarcode);
    
    newConnection.on("ReceiveScanResult", handleResult);
    newConnection.on("receivescanresult", handleResult);

    newConnection.onclose(() => {
      console.warn("⚠️ Connection lost");
      if (isMounted) setConnectionStatus("disconnected");
    });

    return () => {
      isMounted = false;
      if (newConnection.state === "Connected") {
          newConnection.stop();
      }
    };
  }, []);

  const handleBypassGate = async () => {
    try {
      const response = await fetch('http://localhost:5106/api/access/manual-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: bypassForm.student_id,
          bypass_reason: bypassForm.reason,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        setBypassModal(false);
        setBypassForm({ student_id: '', reason: '' });
      } else {
        alert("Failed to log manual override.");
      }
    } catch (err) {
      console.error('❌ Bypass failed:', err);
      alert("Network error processing bypass.");
    }
  };

  const handleLockdown = async () => {
    if (window.confirm('⚠️ CRITICAL ALERT: Are you sure you want to lock down the facility?')) {
      try {
        await fetch('http://localhost:5106/api/access/lockdown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timestamp: new Date().toISOString() })
        });
        alert('🔒 SECURE LOCKDOWN PROTOCOL INITIATED.');
      } catch (err) {
        console.error('Lockdown request failed:', err);
      }
    }
  };

  // The latest scan drives the large banner UI
  const latestScan = accessLog.length > 0 ? accessLog[0] : null;

  return (
    <div className="h-screen flex flex-col bg-slate-950 font-sans overflow-hidden text-slate-200 relative">
      
      {/* HEADER - High Contrast Dark Mode */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-emerald-500" size={28} />
          <h1 className="text-xl font-black text-white tracking-tight hidden sm:block">Security & Access Control</h1>
          <span className={`ml-4 px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest border flex items-center gap-2 shadow-inner ${
            connectionStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            {connectionStatus === 'connected' ? 'System Live' : 'Offline'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{user?.First_Name || user?.first_Name || 'Campus'} {user?.Last_Name || user?.last_Name || 'Guard'}</p>
            <p className="text-xs font-bold text-slate-400 uppercase">Main Gate Station</p>
          </div>
          <button onClick={handleLogout} className="bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white p-2.5 rounded-lg transition-colors border border-slate-700 shadow-sm active:scale-95">
            <LogOut size={18} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-hidden flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: Camera & Focus Scan */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Live Camera Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex-1 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Video className="text-blue-500" size={20} /> Edge Node Live Feed
              </h2>
              <span className="text-[10px] font-black tracking-widest text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg uppercase">
                Cam 01 - Main Entrance
              </span>
            </div>
            
            <div className="flex-1 bg-black rounded-xl border border-slate-800 overflow-hidden relative flex items-center justify-center shadow-inner">
              <img 
                src="http://localhost:5000/video_feed" 
                alt="Live Camera Feed" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
              />
              
              {/* Fallback UI if Python node is off */}
              <div className="absolute inset-0 hidden flex-col items-center justify-center text-slate-600 bg-slate-950">
                <ScanLine size={48} className="mb-4 animate-pulse opacity-30" />
                <p className="font-black text-sm tracking-widest uppercase">Awaiting Edge Node Stream</p>
                <p className="text-xs mt-1 opacity-50 font-medium">Ensure Python vision_node.py is running on port 5000</p>
              </div>

              {/* Tactical Scanning Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                 <div className="w-full h-full border-[1px] border-blue-500/20"></div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500/30 rounded-xl">
                    {/* Corner accents */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
                 </div>
              </div>
            </div>
          </div>

          {/* Current Verification Banner */}
          <div className={`border rounded-2xl p-6 shadow-xl transition-all duration-500 relative overflow-hidden ${
            !latestScan ? 'bg-slate-900 border-slate-800' :
            latestScan.status === 'scanning' ? 'bg-blue-950/40 border-blue-500/50 ring-2 ring-blue-500/20' :
            (latestScan.status === 'approved' || latestScan.status === 'Access Granted') ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-rose-950/40 border-rose-500/40'
          }`}>
            
            {/* Scanning Radar Background Effect */}
            {latestScan?.status === 'scanning' && (
              <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(59,130,246,0.1)_50%,transparent_100%)] animate-[scan_2s_linear_infinite] pointer-events-none"></div>
            )}

            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 relative z-10">
               {latestScan?.status === 'scanning' ? 'BIOMETRIC SCAN IN PROGRESS...' : 'Current Verification'}
            </h2>
            
            {latestScan ? (
              <div className="flex flex-col sm:flex-row sm:items-start gap-6 relative z-10">
                <div className="w-24 h-24 bg-slate-950 rounded-xl border-2 border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative">
                  {latestScan.face_reference_path ? (
                    <img 
                      src={`http://localhost:5106/ReferenceFaces/${latestScan.face_reference_path}?t=${cacheBuster}`} 
                      className={`w-full h-full object-cover transition-all ${latestScan.status === 'scanning' ? 'opacity-50 grayscale' : 'opacity-100'}`} alt="Student"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  
                  <UserCheck size={40} className={`hidden ${(latestScan.status === 'approved' || latestScan.status === 'Access Granted') ? 'text-emerald-500' : 'text-slate-600'}`} style={{ display: latestScan.face_reference_path ? 'none' : 'flex' }} />
                  
                  {/* Overlay Spinner during scanning */}
                  {latestScan.status === 'scanning' && (
                     <div className="absolute inset-0 flex items-center justify-center bg-blue-900/20 backdrop-blur-[2px]">
                        <ScanLine size={32} className="text-blue-400 animate-ping" />
                     </div>
                  )}
                </div>
                
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-white leading-tight">{latestScan.first_name} {latestScan.last_name}</h3>
                      <p className="text-slate-400 font-bold text-sm mt-1">{latestScan.student_id} • Verified User</p>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-xl font-black flex items-center gap-2 shrink-0 transition-colors ${
                      latestScan.status === 'scanning' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse' :
                      (latestScan.status === 'approved' || latestScan.status === 'Access Granted') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                      'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {latestScan.status === 'scanning' ? <ScanLine size={20} className="animate-spin-slow" /> : 
                       (latestScan.status === 'approved' || latestScan.status === 'Access Granted') ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                      
                      {latestScan.status === 'scanning' ? 'VERIFYING FACE...' :
                       (latestScan.status === 'approved' || latestScan.status === 'Access Granted') ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 flex flex-col items-center relative z-10">
                <ScanLine size={32} className="mb-3 opacity-30" />
                <p className="font-bold">Ready for scan...</p>
                <p className="text-xs mt-1 font-medium">Waiting for edge node barcode and face data.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Action Buttons & Event Log */}
        <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0">
          
          {/* Tactical Action Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={() => setBypassModal(true)}
              className="flex-1 bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 font-black py-4 px-2 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 border border-amber-500/30 hover:border-amber-500/50"
            >
              <Unlock size={24} /> 
              <span className="text-xs tracking-widest uppercase text-center">Manual<br/>Bypass</span>
            </button>
            <button 
              onClick={handleLockdown}
              className="flex-1 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 font-black py-4 px-2 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 border border-rose-500/30 hover:border-rose-500/50"
            >
              <ShieldAlert size={24} /> 
              <span className="text-xs tracking-widest uppercase text-center">Trigger<br/>Lockdown</span>
            </button>
          </div>

          {/* Real-time Access Log Sidebar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-lg overflow-hidden flex-1">
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                 <UserCheck size={18} className="text-emerald-500" /> Access Log
              </h2>
              <span className="text-[10px] font-black tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-lg uppercase">Live</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {/* Filter out 'scanning' so it only shows final results in the log */}
              {accessLog.filter(log => log.status !== 'scanning').length === 0 ? (
                 <p className="text-center text-slate-500 text-sm font-bold mt-10">No recent activity.</p>
              ) : (
                accessLog.filter(log => log.status !== 'scanning').map((entry, idx) => (
                  <AccessLogEntry key={idx} entry={entry} />
                ))
              )}
            </div>
          </div>
        </div>

      </main>

      {/* Bypass Modal Dialog */}
      {bypassModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-in fade-in">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
               <Unlock className="text-amber-500" size={24} /> Manual Gate Override
            </h2>
            <p className="text-xs font-bold text-slate-400 mb-6">Log a student without an ID or failed verification.</p>
            
            <div className="space-y-4">
               <div>
                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Student ID</label>
                 <input
                   type="text" placeholder="e.g. 24-1502" value={bypassForm.student_id}
                   onChange={(e) => setBypassForm({...bypassForm, student_id: e.target.value})}
                   className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-amber-500 transition-colors"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Reason for Bypass</label>
                 <input
                   type="text" placeholder="e.g. Forgotten ID, System Error" value={bypassForm.reason}
                   onChange={(e) => setBypassForm({...bypassForm, reason: e.target.value})}
                   className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-amber-500 transition-colors"
                 />
               </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => { setBypassModal(false); setBypassForm({ student_id: '', reason: '' }); }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleBypassGate}
                disabled={!bypassForm.student_id || !bypassForm.reason}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-black py-3 rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:hover:bg-amber-600"
              >
                Confirm Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}} />
    </div>
  );
}