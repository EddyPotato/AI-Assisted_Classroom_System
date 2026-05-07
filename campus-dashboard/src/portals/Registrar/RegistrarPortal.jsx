import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Database, LogOut, Calendar, GraduationCap, Layers, BookOpen, UploadCloud } from 'lucide-react';

import SectionsTab from './components/sections/SectionsTab';
import SchedulesTab from './components/schedules/SchedulesTab';
import UserDirectoryTab from './components/users/UserDirectoryTab';
import StaffDirectoryTab from './components/faculty/StaffDirectoryTab';
import ResourceDirectoryTab from './components/resources/ResourceDirectoryTab';
// Import the new Schedule Importer component
import ScheduleImporter from './views/ScheduleImporter';

export default function RegistrarPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedules');
  
  const userString = localStorage.getItem('campus_user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('campus_user');
    navigate('/login', { replace: true });
  };

  const tabButtonStyle = (tabName) => `
    flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap
    ${activeTab === tabName
      ? 'bg-white text-primary-600 shadow-sm border border-slate-200/50'
      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'}
  `;

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden relative">
      
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Database className="text-primary-600" size={24} />
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Registrar Operations</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">
              {user?.First_Name || user?.first_Name || 'Admin'} {user?.Last_Name || user?.last_Name || ''}
            </p>
            <p className="text-xs font-bold text-primary-600 uppercase">Campus HR</p>
          </div>
          <button onClick={handleLogout} className="bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white p-2 rounded-lg transition-colors border border-rose-200 hover:border-rose-500 shadow-sm">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-scroll">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* TAB NAVIGATION */}
          <div className="flex p-1.5 space-x-2 bg-slate-200/50 rounded-xl w-max border border-slate-200/80 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveTab('schedules')} 
              className={tabButtonStyle('schedules')}
            >
              <Calendar size={18} /> Schedule Directory
            </button>

            {/* NEW: Master Schedule Import Tab */}
            <button
              onClick={() => setActiveTab('import')}
              className={tabButtonStyle('import')}
            >
              <UploadCloud size={18} /> Master Import
            </button>

            <button 
              onClick={() => setActiveTab('resources')} 
              className={tabButtonStyle('resources')}
            >
              <BookOpen size={18} /> Resource Directory
            </button>

            <button 
              onClick={() => setActiveTab('sections')} 
              className={tabButtonStyle('sections')}
            >
              <Layers size={18} /> Section Directory
            </button>

            <button 
              onClick={() => setActiveTab('users')} 
              className={tabButtonStyle('users')}
            >
              <Users size={18} /> Student Directory
            </button>
            
            <button 
              onClick={() => setActiveTab('faculty')} 
              className={tabButtonStyle('faculty')}
            >
              <GraduationCap size={18} /> Staff Directory
            </button>
          </div>

          {/* TAB CONTENT RENDERING */}
          <div className="animate-in fade-in duration-300">
            {activeTab === 'schedules' && <SchedulesTab />}
            {activeTab === 'import' && <ScheduleImporter />}
            {activeTab === 'resources' && <ResourceDirectoryTab />}
            {activeTab === 'sections' && <SectionsTab />}
            {activeTab === 'users' && <UserDirectoryTab />}
            {activeTab === 'faculty' && <StaffDirectoryTab />}
          </div>

        </div>
      </main>
    </div>
  );
}
