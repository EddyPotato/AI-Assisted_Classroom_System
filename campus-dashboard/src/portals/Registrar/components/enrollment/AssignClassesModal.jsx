import { useState, useEffect } from 'react';
import { X, BookOpen, Save, CheckSquare, Square } from 'lucide-react';

export default function AssignClassesModal({ isOpen, onClose, student }) {
  const [sections, setSections] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch reference data when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    // In the next step, we will build these C# API endpoints
    const fetchData = async () => {
      try {
        const [secRes, schedRes] = await Promise.all([
          fetch('http://localhost:5106/api/sections').catch(() => ({ ok: false })),
          fetch('http://localhost:5106/api/schedules').catch(() => ({ ok: false }))
        ]);
        
        if (secRes.ok) setSections(await secRes.json());
        if (schedRes.ok) setSchedules(await schedRes.json());
      } catch (err) {
        console.error("Failed to fetch reference data", err);
      }
    };
    fetchData();
  }, [isOpen]);

  if (!isOpen || !student) return null;

  const isRegular = student.enrollment_Status === 'Regular';

  const toggleSchedule = (schedId) => {
    setSelectedSchedules(prev => 
      prev.includes(schedId) ? prev.filter(id => id !== schedId) : [...prev, schedId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Payload differs based on student type
    const payload = isRegular 
      ? { student_ID: student.student_ID, section_ID: selectedSection }
      : { student_ID: student.student_ID, schedule_IDs: selectedSchedules };

    try {
      const endpoint = isRegular ? '/api/enrollments/bulk' : '/api/enrollments/custom';
      const response = await fetch(`http://localhost:5106${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Classes assigned successfully!");
        onClose();
      } else {
        alert("Failed to assign classes. Ensure backend endpoints exist.");
      }
    } catch (err) {
      // THE FIX: We now log the error to the console to satisfy the 'no-unused-vars' rule!
      console.error("Enrollment Submission Error:", err);
      alert("Network Error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 z-70 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><BookOpen size={20} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Assign Classes</h3>
              <p className="text-xs font-bold text-slate-500 mt-0.5">{student.first_Name} {student.last_Name} ({student.student_ID})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={24}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${isRegular ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
            <strong>{student.enrollment_Status} Student Detected:</strong> {isRegular 
              ? "Select a Section Block to automatically enroll the student in all associated schedules."
              : "Select individual schedules to build a custom class list for this irregular student."}
          </div>

          <form id="assignForm" onSubmit={handleSubmit} className="space-y-4">
            
            {/* REGULAR STUDENT UI: Single Dropdown */}
            {isRegular && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Section Block</label>
                <select 
                  required 
                  value={selectedSection} 
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 shadow-sm"
                >
                  <option value="" disabled>-- Select a Section --</option>
                  {sections.map(sec => (
                    <option key={sec.section_ID} value={sec.section_ID}>{sec.section_Name} ({sec.course})</option>
                  ))}
                  {sections.length === 0 && <option value="SEC-001">SBIT2A (Mock Data)</option>}
                </select>
              </div>
            )}

            {/* IRREGULAR STUDENT UI: Multi-Select List */}
            {!isRegular && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Available Master Schedules</label>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-64 overflow-y-auto bg-slate-50 shadow-inner">
                  {schedules.map(sched => {
                    const isSelected = selectedSchedules.includes(sched.schedule_ID);
                    return (
                      <div 
                        key={sched.schedule_ID} 
                        onClick={() => toggleSchedule(sched.schedule_ID)}
                        className={`p-3 flex items-center gap-4 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-100'}`}
                      >
                        <div className={isSelected ? 'text-blue-600' : 'text-slate-300'}>
                          {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{sched.subject_Code} - {sched.section_ID}</p>
                          <p className="text-xs text-slate-500 font-medium">{sched.class_Days} | {sched.time_Start}-{sched.time_End} | Room: {sched.room_ID}</p>
                        </div>
                      </div>
                    )
                  })}
                  {schedules.length === 0 && <p className="p-4 text-center text-slate-500 text-sm font-bold">No schedules fetched from backend.</p>}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-200 rounded-lg">Cancel</button>
          <button 
            form="assignForm" 
            type="submit" 
            disabled={isSubmitting || (isRegular ? !selectedSection : selectedSchedules.length === 0)} 
            className="px-6 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95"
          >
            <Save size={18}/> {isSubmitting ? 'Saving...' : 'Confirm Enrollments'}
          </button>
        </div>
      </div>
    </div>
  );
}