import { Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  // SECURITY UPDATE: The Logout Sequence
  const handleLogout = () => {
    // 1. Destroy the session token
    localStorage.removeItem('campus_user');
    
    // 2. Redirect to login and wipe the forward history
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <Menu className="text-gray-500 cursor-pointer hover:text-gray-800" size={24} />
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">AI Smart Campus System</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-600 hidden sm:block">Local Network Mode</span>
        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          Admin
        </div>
        
        {/* NEW LOGOUT BUTTON */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border border-slate-200 hover:border-rose-200"
          title="Sign out securely"
        >
          <LogOut size={16} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}