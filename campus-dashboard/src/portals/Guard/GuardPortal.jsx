import { useState } from 'react'; // Removed unused useEffect
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Video, UserCheck, AlertTriangle, LogOut, Unlock } from 'lucide-react';

export default function GuardPortal() {
  const navigate = useNavigate();
  const [camOnline, setCamOnline] = useState(true);
  
  // Removed unused recentScans state to fix ESLint warning

  const userString = localStorage.getItem('campus_user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('campus_user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-300 font-sans overflow-hidden">
      
      {/* TACTICAL HEADER */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-amber-500" size={28} />
          <h1 className="text-xl font-black text-white tracking-tight">Main Gate Security Terminal</h1>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-white uppercase tracking-wider">{user?.First_Name} {user?.Last_Name}</span>
            <span className="text-xs font-bold text-emerald-400">ON DUTY</span>
          </div>
          <button onClick={handleLogout} className="bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white p-2 rounded-lg transition-colors border border-rose-500/30">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* MAIN VIEW */}
      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        
        {/* LEFT PANEL: CAMERA FEED */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex-1 relative border-2 border-slate-800">
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              {camOnline ? (
                 <span className="bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-md shadow-lg animate-pulse tracking-widest">LIVE</span>
              ) : (
                 <span className="bg-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-md shadow-lg tracking-widest">SIGNAL LOST</span>
              )}
              <span className="bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-md backdrop-blur-md tracking-widest">CAM_01: MAIN GATE</span>
            </div>
            
            <img 
               src="http://localhost:5000/video_feed" 
               alt="Live Camera Feed"
               className={`w-full h-full object-cover ${!camOnline ? 'hidden' : ''}`}
               onLoad={() => setCamOnline(true)}
               onError={() => setCamOnline(false)}
            />

            {!camOnline && (
               <div className="text-center absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
                  <AlertTriangle className="mx-auto text-rose-600 mb-4 animate-pulse" size={64} />
                  <p className="text-white text-xl font-black tracking-wider">HARDWARE DISCONNECTED</p>
                  <p className="text-slate-500 text-sm mt-2 font-bold uppercase">Awaiting Edge Node Reconnection</p>
               </div>
            )}
          </div>

          {/* MANUAL OVERRIDES */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex gap-4">
            <button className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg border border-amber-400">
              <Unlock size={24} /> BYPASS GATE (FORGOTTEN ID)
            </button>
            <button className="flex-1 bg-rose-700 hover:bg-rose-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg border border-rose-500">
              <ShieldAlert size={24} /> TRIGGER LOCKDOWN
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE LOG */}
        <div className="w-96 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-800 bg-slate-950/50">
            <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
              <UserCheck size={20} className="text-emerald-400"/> ACCESS LOG
            </h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
             <div className="text-center text-slate-600 font-bold mt-10">Awaiting gate scans...</div>
          </div>
        </div>

      </main>
    </div>
  );
}