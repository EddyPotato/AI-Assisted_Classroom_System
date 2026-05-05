import { useState, useEffect, useCallback } from 'react';
import { Search, CalendarPlus } from 'lucide-react';
import MasterScheduleTable from './MasterScheduleTable';
import ScheduleForm from './ScheduleForm';
import ConfirmModal from '../../../../components/ui/ConfirmModal';

export default function SchedulesTab() {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'form'
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [schedules, setSchedules] = useState([]);
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, scheduleId: null });

  const fetchSchedules = useCallback(() => {
    fetch('http://localhost:5106/api/schedules')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setSchedules(data); })
      .catch(err => console.error("Failed to fetch schedules:", err));
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  // View Navigation Handlers
  const handleOpenCreate = () => {
    setSelectedSchedule(null);
    setCurrentView('form');
  };

  const handleOpenEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setSelectedSchedule(null);
    setCurrentView('list');
    fetchSchedules(); // Refresh table when returning
  };

  // Delete Handlers
  const handleDeleteClick = (id) => {
    setConfirmModal({ isOpen: true, scheduleId: id });
  };

  const executeDelete = async () => {
    try {
      await fetch(`http://localhost:5106/api/schedules/${confirmModal.scheduleId}`, { method: 'DELETE' });
      fetchSchedules();
    } catch (err) { console.error(err); }
    setConfirmModal({ isOpen: false, scheduleId: null });
  };

  const filteredSchedules = schedules.filter(s => 
    (s.subject_Code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.section_ID || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.professor_ID || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- DRILL-DOWN FORM VIEW ---
  if (currentView === 'form') {
    return <ScheduleForm schedule={selectedSchedule} onBack={handleBackToList} onSuccess={handleBackToList} />;
  }

  // --- MAIN DIRECTORY VIEW ---
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <ConfirmModal 
        isOpen={confirmModal.isOpen} 
        type="danger" 
        title="Delete Schedule" 
        message="Are you sure you want to delete this schedule block? This will remove it from the section's timetable."
        onConfirm={executeDelete} 
        onCancel={() => setConfirmModal({ isOpen: false, scheduleId: null })} 
      />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Master Schedule</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage block timetables, room assignments, and faculty schedules.</p>
        </div>
      </div>

      <div className="p-5 border border-slate-200 bg-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by Subject, Section, or Professor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        <button 
          onClick={handleOpenCreate}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <CalendarPlus size={18} /> Add Schedule
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <MasterScheduleTable schedules={filteredSchedules} onEdit={handleOpenEdit} onDelete={handleDeleteClick} />
      </div>
    </div>
  );
}