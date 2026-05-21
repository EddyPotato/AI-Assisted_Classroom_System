import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Database, LogOut, Calendar, GraduationCap, 
  Layers, BookOpen, UploadCloud, CalendarDays 
} from 'lucide-react';

import SectionsTab from './components/sections/SectionsTab';
import SchedulesTab from './components/schedules/SchedulesTab';
import UserDirectoryTab from './components/users/UserDirectoryTab';
import StaffDirectoryTab from './components/faculty/StaffDirectoryTab';
import ResourceDirectoryTab from './components/resources/ResourceDirectoryTab';
import ScheduleImporter from './views/ScheduleImporter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5106';
const TERMS_ENDPOINT = `${API_BASE_URL}/api/terms`;

export default function RegistrarPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedules');
  
  // Real Data State Management
  const [terms, setTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [isLoadingTerms, setIsLoadingTerms] = useState(true);
  
  const userString = localStorage.getItem('campus_user');
  const user = userString ? JSON.parse(userString) : null;

  // Asynchronously fetch REAL Academic Terms from the database
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch(TERMS_ENDPOINT);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        setTerms(data);
        
        // Auto-select the currently active semester on login
        const activeTerm = data.find(t => t.is_Active) || data[0];
        if (activeTerm) {
          setSelectedTermId(activeTerm.term_ID);
        }
      } catch (error) {
        console.error("Failed to fetch Academic Terms from database:", error);
      } finally {
        setIsLoadingTerms(false);
      }
    };

    fetchTerms();
  }, []);

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
          
          {/* Global Academic Term Selector */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-inner">
            <CalendarDays size={16} className="text-primary-600" />
            <select
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
              disabled={isLoadingTerms || terms.length === 0}
              className="bg-transparent font-bold text-sm text-slate-700 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              {isLoadingTerms ? (
                <option>Loading Terms...</option>
              ) : terms.length === 0 ? (
                <option>No Terms Available</option>
              ) : (
                terms.map(t => (
                  <option key={t.term_ID} value={t.term_ID}>
                    {t.school_Year} • {t.semester} {t.is_Active ? '(Active)' : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="text-right hidden sm:block ml-4 border-l border-slate-200 pl-4">
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
            <button onClick={() => setActiveTab('schedules')} className={tabButtonStyle('schedules')}>
              <Calendar size={18} /> Schedule Directory
            </button>
            <button onClick={() => setActiveTab('import')} className={tabButtonStyle('import')}>
              <UploadCloud size={18} /> Master Import
            </button>
            <button onClick={() => setActiveTab('resources')} className={tabButtonStyle('resources')}>
              <BookOpen size={18} /> Resource Directory
            </button>
            <button onClick={() => setActiveTab('sections')} className={tabButtonStyle('sections')}>
              <Layers size={18} /> Section Directory
            </button>
            <button onClick={() => setActiveTab('users')} className={tabButtonStyle('users')}>
              <Users size={18} /> Student Directory
            </button>
            <button onClick={() => setActiveTab('faculty')} className={tabButtonStyle('faculty')}>
              <GraduationCap size={18} /> Staff Directory
            </button>
          </div>

          {/* TAB CONTENT RENDERING */}
          <div className="animate-in fade-in duration-300">
            {activeTab === 'schedules' && <SchedulesTab termId={selectedTermId} />}
            {activeTab === 'import' && <ScheduleImporter termId={selectedTermId} />}
            {activeTab === 'resources' && <ResourceDirectoryTab termId={selectedTermId} />}
            {activeTab === 'sections' && <SectionsTab termId={selectedTermId} />}
            {activeTab === 'users' && <UserDirectoryTab termId={selectedTermId} />}
            {activeTab === 'faculty' && <StaffDirectoryTab termId={selectedTermId} />}
          </div>

        </div>
      </main>
    </div>
  );
}
