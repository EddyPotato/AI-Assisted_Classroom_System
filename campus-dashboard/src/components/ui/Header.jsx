import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import qcuLogo from '../../assets/qcu-logo.svg';

export default function Header() {
  const navigate = useNavigate();
  const rawSession = sessionStorage.getItem('campus_user');
  const storedData = rawSession ? JSON.parse(rawSession) : {};
  const userData = storedData.user || storedData;
  
  const roleName = userData.role || userData.Role || 'User';
  const firstName = userData.first_Name || userData.First_Name || 'Staff';
  const lastName = userData.last_Name || userData.Last_Name || '';
  const facePath = userData.face_Reference_Path || userData.Face_Reference_Path;

  const handleLogout = () => {
    sessionStorage.removeItem('campus_user');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-20 flex shrink-0 items-center justify-between px-8 shadow-sm z-30">
      
      {/* LEFT SIDE: Brand & Title (Moved from Sidebar) */}
      <div className="flex items-center space-x-4">
        <img src={qcuLogo} alt="QCU Logo" className="h-12 w-12 object-contain" />
        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">Quezon City University</h1>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-0.5">
            {roleName.toUpperCase()} PORTAL
          </span>
        </div>
      </div>
      
      {/* RIGHT SIDE: Profile & Logout */}
      <div className="flex items-center space-x-6">
        
        <div className="flex items-center space-x-4 border-r border-gray-200 pr-6">
          {/* Text strictly on the left side of the image */}
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-gray-900">{firstName} {lastName}</div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{roleName}</div>
          </div>
          
          {/* Image strictly on the right side of the text */}
          {facePath ? (
            <img 
              src={`http://localhost:5106/ReferenceFaces/${facePath.split('/').pop()}`} 
              alt="Profile" 
              className="h-11 w-11 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
              onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
            />
          ) : (
            <div className="h-11 w-11 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
              <User className="h-6 w-6" />
            </div>
          )}
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-600 text-white hover:bg-red-700 px-5 py-2.5 rounded-full transition-colors font-semibold shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm hidden sm:block">Logout</span>
        </button>

      </div>
    </header>
  );
}