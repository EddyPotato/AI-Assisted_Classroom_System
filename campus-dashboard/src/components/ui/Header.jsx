import { LogOut, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  // Retrieve user from session storage securely
  const userString = localStorage.getItem('campus_user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Safely handle C# JSON serialization (camelCase vs PascalCase)
  const firstName = user?.First_Name || user?.first_Name || 'Professor';
  const lastName = user?.Last_Name || user?.last_Name || '';
  const role = user?.Role || user?.role || 'Faculty';

  const initial = firstName.charAt(0).toUpperCase();
  const fullName = `${firstName} ${lastName}`.trim();

  // THE ESCAPE HATCH
  const handleLogout = () => {
    localStorage.removeItem('campus_user');
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <GraduationCap className="text-blue-600" size={28} strokeWidth={2.5} />
        <h1 className="text-xl font-black text-gray-800 tracking-tight">Professor Dashboard</h1>
      </div>
      <div className="flex items-center gap-5">
        
        {/* DYNAMIC USER PROFILE */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800">{fullName}</p>
            <p className="text-xs font-bold text-blue-600 uppercase">{role}</p>
          </div>
          <div className="h-9 w-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-blue-100">
            {initial}
          </div>
        </div>
        
        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
        
        {/* WORKING LOGOUT BUTTON */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all border border-rose-200 hover:border-rose-500 shadow-sm"
          title="Sign out securely"
        >
          <LogOut size={16} strokeWidth={2.5} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}