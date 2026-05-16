import { useState, useEffect } from 'react';
import { XCircle, Calendar, Save, AlertCircle, Loader2 } from 'lucide-react';

export default function ScheduleForm({
  schedule,
  termId,
  sectionId = '', // Optional: Used to lock the section dropdown when opened from the Section Roster
  onClose, onBack, // Supports both Master View and Roster View prop naming conventions
  onSave, onSuccess,
  initialError
}) {
  const closeHandler = onClose || onBack;
  const isInternalSave = !onSave && onSuccess;

  const [formData, setFormData] = useState({
    subject_Code: schedule?.subject_Code || '',
    subject_Type: schedule?.subject_Type || 'Lec',
    section_ID: schedule?.section_ID || sectionId || '',
    professor_ID: schedule?.professor_ID || '',
    room_ID: schedule?.room_ID || '',
    time_Start: schedule?.time_Start || '',
    time_End: schedule?.time_End || '',
    class_Days: schedule?.class_Days || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(initialError || null);

  // Real Database Lookup States
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isFetchingLookups, setIsFetchingLookups] = useState(true);

  // THE FIX: Moved logic into the useEffect and applied the Promise.resolve() trick
  useEffect(() => {
    let isMounted = true;

    const loadLookups = async () => {
      await Promise.resolve(); // Force async microtask context to prevent ESLint warnings
      if (!isMounted) return;

      try {
        const [subRes, secRes, profRes, roomRes] = await Promise.all([
          fetch('http://localhost:5000/api/subjects'),
          fetch('http://localhost:5000/api/sections'),
          fetch('http://localhost:5000/api/staff'),
          fetch('http://localhost:5000/api/rooms')
        ]);

        const [subData, secData, profData, roomData] = await Promise.all([
          subRes.json(), secRes.json(), profRes.json(), roomRes.json()
        ]);

        if (isMounted) {
          setSubjects(Array.isArray(subData) ? subData : []);
          setSections(Array.isArray(secData) ? secData : []);
          // Only allow Faculty staff to be assigned to schedules
          setProfessors(Array.isArray(profData) ? profData.filter(p => p.role === 'Faculty') : []);
          setRooms(Array.isArray(roomData) ? roomData : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching lookups:", err);
          setError("Failed to load dropdown options. Please check the backend connection.");
        }
      } finally {
        if (isMounted) setIsFetchingLookups(false);
      }
    };

    loadLookups();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // CRITICAL: Inject the active termId into the payload
    const payload = {
      ...formData,
      term_ID: termId
    };

    try {
      if (onSave) {
        // Master Schedule View handles the API call externally
        await onSave(payload);
      } else if (isInternalSave) {
        // Section Roster View relies on the form to process the API call internally
        const url = schedule 
           ? `http://localhost:5000/api/schedules/${schedule.schedule_ID}` 
           : `http://localhost:5000/api/schedules`;
           
        const method = schedule ? 'PUT' : 'POST';

        const res = await fetch(url, {
           method,
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload)
        });

        if (!res.ok) {
           const errData = await res.json();
           throw new Error(errData.message || 'Failed to save schedule to database.');
        }
        
        onSuccess();
      }
    } catch (err) {
      console.error("Schedule save error:", err);
      setError(err.message || "An unexpected error occurred during save.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
              <Calendar className="text-primary-600" /> 
              {schedule ? 'Edit Schedule' : 'Create New Schedule'}
            </h3>
            <p className="text-sm font-bold text-slate-500 mt-0.5">
              Assigning subject to <span className="text-primary-600">{termId}</span>
            </p>
          </div>
          <button onClick={closeHandler} className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50">
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[75vh]">
          
          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm">
              <AlertCircle size={20} className="shrink-0" /> {error}
            </div>
          )}

          {isFetchingLookups ? (
             <div className="flex flex-col items-center justify-center py-12 text-slate-400">
               <Loader2 className="animate-spin mb-4 text-primary-500" size={32} />
               <p className="font-bold text-sm">Loading registry data from database...</p>
             </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Subject</label>
                  <select 
                    required 
                    value={formData.subject_Code}
                    onChange={(e) => setFormData({...formData, subject_Code: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="" disabled>Select Subject</option>
                    {subjects.map(s => <option key={s.subject_Code} value={s.subject_Code}>{s.subject_Code} - {s.title}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Type</label>
                  <select 
                    value={formData.subject_Type}
                    onChange={(e) => setFormData({...formData, subject_Type: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Lec">Lecture</option>
                    <option value="Lab">Laboratory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Section</label>
                  <select 
                    required 
                    disabled={!!sectionId} // Lock dropdown if opened directly from a Section Roster
                    value={formData.section_ID}
                    onChange={(e) => setFormData({...formData, section_ID: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    <option value="" disabled>Select Section</option>
                    {sections.map(s => <option key={s.section_ID} value={s.section_ID}>{s.section_Name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Room</label>
                  <select 
                    required 
                    value={formData.room_ID}
                    onChange={(e) => setFormData({...formData, room_ID: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="" disabled>Select Room</option>
                    {rooms.map(r => <option key={r.room_ID} value={r.room_ID}>{r.room_ID} ({r.building})</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Professor</label>
                  <select 
                    value={formData.professor_ID}
                    onChange={(e) => setFormData({...formData, professor_ID: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">TBA (To Be Announced)</option>
                    {professors.map(p => <option key={p.user_ID} value={p.user_ID}>{p.last_Name}, {p.first_Name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Start Time</label>
                  <input 
                    type="time" 
                    required 
                    value={formData.time_Start}
                    onChange={(e) => setFormData({...formData, time_Start: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">End Time</label>
                  <input 
                    type="time" 
                    required 
                    value={formData.time_End}
                    onChange={(e) => setFormData({...formData, time_End: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Class Days</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., Mon/Wed/Fri or Tue/Thu"
                    value={formData.class_Days}
                    onChange={(e) => setFormData({...formData, class_Days: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6 pt-6 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={closeHandler}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-md hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {schedule ? 'Update Schedule' : 'Save Schedule'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}