import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';

import ConfirmModal from '../../../../components/ui/ConfirmModal';
import ScheduleForm from './ScheduleForm';
import MasterScheduleTable from './MasterScheduleTable';

// Safe pure function
const getSchedulesData = async () => {
  try {
    const response = await fetch('http://localhost:5106/api/schedules');
    return response.ok ? await response.json() : [];
  } catch {
    return [];
  }
};

export default function SchedulesTab() {
  const [schedules, setSchedules] = useState([]); 
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });

  const initialFormState = { 
    schedule_ID: '', subject_Code: '', section_ID: '', 
    professor_ID: '', room_ID: '', time_Start: '', 
    time_End: '', class_Days: '' 
  };
  const [formData, setFormData] = useState(initialFormState);

  // FETCH LOGIC
  const fetchSchedules = useCallback(() => {
    let isMounted = true;
    getSchedulesData().then(data => { if (isMounted) setSchedules(data); });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const cleanup = fetchSchedules();
    return cleanup;
  }, [fetchSchedules]);

  // HANDLERS
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateClick = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setShowScheduleForm(true);
  };

  const handleEditClick = (sched) => {
    setFormData({
      schedule_ID: sched.schedule_ID, subject_Code: sched.subject_Code || '',
      section_ID: sched.section_ID || '', professor_ID: sched.professor_ID || '',
      room_ID: sched.room_ID || '', time_Start: sched.time_Start || '',
      time_End: sched.time_End || '', class_Days: sched.class_Days || ''
    });
    setIsEditing(true);
    setShowScheduleForm(true);
  };

  const handleCancelForm = () => {
    setShowScheduleForm(false);
    setIsEditing(false);
    setFormData(initialFormState);
  };

  const requestSave = () => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: isEditing ? 'Confirm Schedule Update' : 'Confirm New Schedule',
      message: isEditing ? 'Are you sure you want to modify this active schedule?' : 'Are you sure you want to create this new schedule?',
      onConfirm: executeSave
    });
  };

  const executeSave = async () => {
    setModal({ ...modal, isOpen: false }); 
    try {
      const url = isEditing ? `http://localhost:5106/api/schedules/${formData.schedule_ID}` : 'http://localhost:5106/api/schedules';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setModal({
          isOpen: true, type: 'success', title: 'Success!',
          message: isEditing ? 'Schedule updated.' : 'New schedule saved.',
          onConfirm: () => {
            setModal({ ...modal, isOpen: false });
            setShowScheduleForm(false);
            setIsEditing(false);
            setFormData(initialFormState);
            fetchSchedules(); 
          }
        });
      } else {
        const errorData = await response.json();
        alert(`Database Error: ${errorData.message}`);
      }
    } catch {
      alert("Error connecting to backend API.");
    }
  };

  // NEW: Delete Handlers for Schedules
  const requestDelete = (sched) => {
    setModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Master Directory',
      message: `Are you sure you want to delete Schedule ${sched.schedule_ID} for ${sched.subject_Code}? This will remove it from all faculty and student dashboards.`,
      onConfirm: () => executeDelete(sched.schedule_ID)
    });
  };

  const executeDelete = async (id) => {
    setModal({ ...modal, isOpen: false }); 
    try {
      const response = await fetch(`http://localhost:5106/api/schedules/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchSchedules();
      } else {
        alert("Database Error: Failed to delete.");
      }
    } catch {
      alert("Error connecting to backend API.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ConfirmModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal({ ...modal, isOpen: false })} />
      
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Master Directory</h2>
          <p className="text-slate-500 mt-1 font-medium">Create and manage class sections, room assignments, and schedules.</p>
        </div>
        
        <button onClick={() => showScheduleForm ? handleCancelForm() : handleCreateClick()} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2">
          {showScheduleForm ? 'Cancel Form' : <><Plus size={18} /> Create Schedule</>}
        </button>
      </div>

      {showScheduleForm && (
        <ScheduleForm formData={formData} isEditing={isEditing} handleChange={handleChange} handleCancelForm={handleCancelForm} requestSave={requestSave} />
      )}

      {/* NEW: Passed handleDeleteClick down to the table */}
      <MasterScheduleTable 
        schedules={schedules} 
        handleEditClick={handleEditClick} 
        handleDeleteClick={requestDelete} 
      />
    </div>
  );
}