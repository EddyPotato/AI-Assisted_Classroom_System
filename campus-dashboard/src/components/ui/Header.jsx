import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import qcuLogo from '../../assets/qcu-logo.svg';

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('campus_user') || '{}');
  
  const roleName = user.role || user.Role || 'User';
  const firstName = user.first_Name || user.First_Name || 'Staff';
  const lastName = user.last_Name || user.Last_Name || '';
  const facePath = user.face_Reference_Path || user.Face_Reference_Path;

  const handleLogout = () => {
    sessionStorage.removeItem('campus_user');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-20 flex shrink-0 items-center justify-between px-8 shadow-sm z-30">
      
      <div className="flex items-center space-x-4">
        <img src={qcuLogo} alt="QCU Logo" className="h-12 w-12 object-contain" />
        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">Quezon City University</h1>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-0.5">PRINCIPAL PORTAL</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        
        <div className="flex items-center space-x-4 border-r border-gray-200 pr-6">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-gray-900">{firstName} {lastName}</div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{roleName}</div>
          </div>
          
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

        {/* The Red Pill Logout Button */}
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