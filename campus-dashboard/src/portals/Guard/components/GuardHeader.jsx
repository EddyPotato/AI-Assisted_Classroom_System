import { ShieldCheck, LogOut, LayoutDashboard, History } from 'lucide-react';

export default function GuardHeader({ user, connectionStatus, activeTab, setActiveTab, onLogout }) {
  return (
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
          onClick={onLogout} 
          className="bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 p-2.5 rounded-lg transition-colors border border-slate-200 shadow-sm active:scale-95"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}