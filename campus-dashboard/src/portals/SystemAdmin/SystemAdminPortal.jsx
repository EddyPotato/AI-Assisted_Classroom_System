import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminHeader from './components/AdminHeader';
import ServerHealthView from './views/ServerHealthView';
import CameraManagerView from './views/CameraManagerView';
import AcademicTermsManagerView from './views/AcademicTermsManagerView'; // THE FIX: Imported the real view

export default function SystemAdminPortal() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('campus_user') || 'null');
  
  const [activeTab, setActiveTab] = useState('health');

  const handleLogout = () => {
    localStorage.removeItem('campus_user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen flex flex-col font-sans bg-slate-50 text-slate-900 overflow-hidden">
      <AdminHeader 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-7xl mx-auto h-full">
          {activeTab === 'health' && <ServerHealthView />}
          {activeTab === 'cameras' && <CameraManagerView />}
          
          {/* THE FIX: Replaced the inline placeholder with the actual real-data component */}
          {activeTab === 'terms' && <AcademicTermsManagerView />}
          
          {activeTab === 'access' && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-4">
              <p className="font-bold text-lg">Access Privileges Module</p>
              <p className="text-sm">Connecting to Users database in next phase...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}