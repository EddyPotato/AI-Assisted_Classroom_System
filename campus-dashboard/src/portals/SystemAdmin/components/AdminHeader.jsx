import { Server, LogOut, Activity, Video, ShieldAlert } from 'lucide-react';

export default function AdminHeader({ user, activeTab, setActiveTab, onLogout }) {
  const navBtn = (id, icon, label) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
        activeTab === id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Server className="text-indigo-600" size={28} />
          <h1 className="text-xl font-black text-slate-800 tracking-tight hidden sm:block">IT Operations</h1>
        </div>
        
        <div className="hidden md:flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          {navBtn('health', <Activity size={16} />, 'Server Health')}
          {navBtn('cameras', <Video size={16} />, 'Hardware Nodes')}
          {navBtn('access', <ShieldAlert size={16} />, 'Access Control')}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-slate-800">{user?.first_Name || user?.First_Name || 'System'} {user?.last_Name || user?.Last_Name || 'Admin'}</p>
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Root Access</p>
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