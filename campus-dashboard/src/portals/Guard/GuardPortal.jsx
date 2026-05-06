import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, ShieldAlert, Unlock, UserCheck } from 'lucide-react';
import { HubConnectionBuilder } from "@microsoft/signalr";

// Import your newly extracted components
import AccessLogEntry from './components/AccessLogEntry';
import PhaseStepper from './components/PhaseStepper';
import VerificationPanel from './components/VerificationPanel';
import LiveCameraFeed from './components/LiveCameraFeed';
import BypassModal from './components/BypassModal';

export default function GuardPortal() {
  const navigate = useNavigate();
  const [accessLog, setAccessLog] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [bypassModalOpen, setBypassModalOpen] = useState(false);
  const [bypassForm, setBypassForm] = useState({ student_id: '', reason: '' });
  const [cacheBuster] = useState(() => Date.now());

  const user = JSON.parse(localStorage.getItem('campus_user') || 'null');

  useEffect(() => {
    let isMounted = true;
    const newConnection = new HubConnectionBuilder().withUrl("http://localhost:5106/campushub").withAutomaticReconnect().build();

    newConnection.start()
      .then(() => isMounted && setConnectionStatus('connected'))
      .catch(() => isMounted && setConnectionStatus('disconnected'));

    const handleBarcode = (data) => isMounted && setAccessLog(prev => [data, ...prev.filter(log => log.status !== 'scanning' && log.status !== 'missing_face')]);
    const handleResult = (data) => isMounted && setAccessLog(prev => [data, ...prev.filter(log => log.status !== 'scanning' && log.status !== 'missing_face')].slice(0, 50));

    newConnection.on("ReceiveBarcode", handleBarcode);
    newConnection.on("receivebarcode", handleBarcode); 
    newConnection.on("ReceiveScanResult", handleResult);
    newConnection.on("receivescanresult", handleResult); 

    return () => { isMounted = false; newConnection.stop(); };
  }, []);

  const handleBypassSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5106/api/access/manual-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: bypassForm.student_id, bypass_reason: bypassForm.reason, timestamp: new Date().toISOString() })
      });
      if (response.ok) {
        setBypassModalOpen(false);
        setBypassForm({ student_id: '', reason: '' });
      } else {
        alert("Failed to log manual override.");
      }
    } catch {
      // FIX: Omitted the unused 'err' parameter entirely (valid in ES2019+)
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
      } catch (error) {
        // FIX: Handled the error object so the block is no longer empty
        console.error("Lockdown sequence failed:", error);
      }
    }
  };

  const latestScan = accessLog.length > 0 ? accessLog[0] : null;

  return (
    <div className="h-screen flex flex-col bg-slate-100 font-sans overflow-hidden text-slate-900">
      
      {/* GLOBAL HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-blue-600" size={28} />
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Security & Access Control</h1>
          <span className={`ml-4 px-3 py-1 rounded-lg text-[10px] uppercase font-black border flex items-center gap-2 ${connectionStatus === 'connected' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
            {connectionStatus === 'connected' ? 'System Live' : 'Offline'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{user?.First_Name || user?.first_Name || 'Campus'} {user?.Last_Name || user?.last_Name || 'Guard'}</p>
            <p className="text-xs font-bold text-slate-500 uppercase">Main Gate Station</p>
          </div>
          <button onClick={() => navigate('/login', { replace: true })} className="bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 p-2.5 rounded-lg transition-colors border border-slate-200">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        
        {/* LEFT COLUMN: Massive Camera (Takes up all available remaining space) */}
        {/* FIX: Replaced flex-[3] with canonical flex-3 */}
        <div className="flex-3 flex flex-col min-w-[60%] h-full pb-4">
            <LiveCameraFeed latestScan={latestScan} />
        </div>

        {/* RIGHT COLUMN: Sidebar Control Center (Fixed width, vertically stacked) */}
        {/* FIX: Replaced min-w-[360px] with min-w-90 and max-w-[450px] with max-w-112.5 */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pb-4 min-w-90 max-w-112.5">
          <PhaseStepper latestScan={latestScan} />
          <VerificationPanel latestScan={latestScan} cacheBuster={cacheBuster} />
          
          {/* Tactical Buttons */}
          <div className="flex gap-3 shrink-0">
            <button onClick={() => setBypassModalOpen(true)} className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-black py-4 rounded-xl flex items-center justify-center gap-2 border border-amber-200 shadow-sm transition-all active:scale-95">
              <Unlock size={18} /> <span className="text-[10px] uppercase tracking-widest">Manual Bypass</span>
            </button>
            <button onClick={handleLockdown} className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black py-4 rounded-xl flex items-center justify-center gap-2 border border-rose-200 shadow-sm transition-all active:scale-95">
              <ShieldAlert size={18} /> <span className="text-[10px] uppercase tracking-widest">Lockdown</span>
            </button>
          </div>

          {/* Event Log */}
          {/* FIX: Replaced min-h-[250px] with canonical min-h-62.5 */}
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col flex-1 shadow-sm overflow-hidden min-h-62.5">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <UserCheck size={16} className="text-blue-600" /> Event Log
                </h2>
                <span className="text-[10px] font-black tracking-widest bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md uppercase">Live</span>
            </div>
            <div className="p-3 space-y-2 overflow-y-auto flex-1 bg-white">
              {accessLog.filter(log => log.status !== 'scanning').map((entry, idx) => <AccessLogEntry key={idx} entry={entry} />)}
            </div>
          </div>
        </div>
      </main>

      <BypassModal 
        isOpen={bypassModalOpen} 
        onClose={() => { setBypassModalOpen(false); setBypassForm({ student_id: '', reason: '' }); }} 
        onSubmit={handleBypassSubmit} 
        bypassForm={bypassForm} 
        setBypassForm={setBypassForm} 
      />
      
      {/* Keyframe Animations injected globally */}
      <style dangerouslySetInnerHTML={{__html: `@keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } .animate-spin-slow { animation: spin 3s linear infinite; }`}} />
    </div>
  );
}