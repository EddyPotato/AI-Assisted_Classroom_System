import { useMemo, useState } from 'react';
import { Calendar, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { useGlobalScheduleLogic } from './hooks/useGlobalScheduleLogic';
import MasterScheduleTable from './MasterScheduleTable';
import ScheduleForm from './ScheduleForm';

export default function SchedulesTab({ termId }) {
  const { 
    schedules, 
    isLoading, 
    error, 
    createSchedule, 
    updateSchedule, 
    deleteSchedule 
  } = useGlobalScheduleLogic(termId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formError, setFormError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'section_Name', direction: 'asc' });

  const handleOpenForm = (schedule = null) => {
    setEditingSchedule(schedule);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSchedule(null);
    setFormError(null);
  };

  const handleSave = async (scheduleData) => {
    setFormError(null);
    let result;
    
    if (editingSchedule) {
      result = await updateSchedule(editingSchedule.schedule_ID, scheduleData);
    } else {
      result = await createSchedule(scheduleData);
    }
    
    if (result.success) {
      handleCloseForm();
    } else {
      setFormError(`Failed to save schedule: ${result.error}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule? This action cannot be undone.")) {
      const result = await deleteSchedule(id);
      if (!result.success) {
        alert(`Error deleting schedule: ${result.error}`);
      }
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? '';
      const bValue = b[sortConfig.key] ?? '';
      const comparison = String(aValue).localeCompare(String(bValue), undefined, {
        numeric: true,
        sensitivity: 'base'
      });

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [schedules, sortConfig]);

  // STRICT BLOCK: Prevent accessing schedules without an active term
  if (!termId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center h-96 text-center animate-in fade-in">
        <AlertCircle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-black text-slate-800">No Academic Term Selected</h2>
        <p className="text-slate-500 max-w-md mt-2">
          Please select an active School Year and Semester from the header dropdown to view and manage the master schedule directory.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Calendar className="text-primary-600" />
            Master Schedule Directory
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage all class schedules and room assignments for <span className="font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">{termId}</span>.
          </p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center gap-2"
        >
          <Plus size={18} /> New Schedule
        </button>
      </div>

      {/* ERROR BANNERS */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 font-bold text-sm shadow-sm">
          <AlertCircle size={20} /> {error}
        </div>
      )}
      
      {formError && !isFormOpen && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 font-bold text-sm shadow-sm">
          <AlertCircle size={20} /> {formError}
        </div>
      )}

      {/* SCHEDULES DATA TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="animate-spin mb-4 text-primary-500" size={32} />
            <p className="font-bold text-sm">Loading Schedules for {termId}...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-6">
            <Calendar size={48} className="mb-4 text-slate-300" />
            <p className="font-bold text-lg text-slate-500">No Schedules Found</p>
            <p className="text-sm mt-1">There are no classes scheduled for this academic term yet.</p>
          </div>
        ) : (
          <MasterScheduleTable 
            schedules={sortedSchedules} 
            sortConfig={sortConfig}
            onSort={handleSort}
            onEdit={handleOpenForm} 
            onDelete={handleDelete} 
          />
        )}
      </div>

      {/* SCHEDULE CREATION / EDIT MODAL */}
      {isFormOpen && (
        <ScheduleForm 
          schedule={editingSchedule} 
          onClose={handleCloseForm} 
          onSave={handleSave} 
          termId={termId}
          initialError={formError}
        />
      )}
      
    </div>
  );
}
