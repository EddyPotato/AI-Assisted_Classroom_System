import { Activity, Camera, Shield, LogOut, Clock } from 'lucide-react';

export default function AdminHeader({ user, activeTab, setActiveTab, onLogout }) {
  const navItemClass = (tabName) => `
    flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors
    ${activeTab === tabName 
      ? 'bg-slate-800 text-white shadow-md' 
      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
  `;

  return (
    <header className="bg-slate-950 text-slate-200 border-b border-slate-800 h-16 flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <Shield className="text-primary-500" size={24} />
          <h1 className="text-xl font-black tracking-tight text-white hidden sm:block">System Admin Portal</h1>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
          <button onClick={() => setActiveTab('health')} className={navItemClass('health')}>
            <Activity size={18} /> <span className="hidden md:inline">Server Health</span>
          </button>
          <button onClick={() => setActiveTab('cameras')} className={navItemClass('cameras')}>
            <Camera size={18} /> <span className="hidden md:inline">Cameras</span>
          </button>
          {/* THE FIX: Added Academic Terms Navigation Tab */}
          <button onClick={() => setActiveTab('terms')} className={navItemClass('terms')}>
            <Clock size={18} /> <span className="hidden md:inline">Academic Terms</span>
          </button>
          <button onClick={() => setActiveTab('access')} className={navItemClass('access')}>
            <Shield size={18} /> <span className="hidden md:inline">Privileges</span>
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden lg:block">
          <p className="text-sm font-bold text-white">
            {user?.First_Name || 'System'} {user?.Last_Name || 'Admin'}
          </p>
          <p className="text-xs font-bold text-primary-500 uppercase">MIS Department</p>
        </div>
        <button 
          onClick={onLogout}
          className="p-2 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500 transition-colors border border-rose-500/30 hover:border-rose-500"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}