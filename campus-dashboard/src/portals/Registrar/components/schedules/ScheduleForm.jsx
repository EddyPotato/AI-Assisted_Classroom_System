import { useState } from 'react';
import { ArrowLeft, Save, CalendarPlus, Edit2 } from 'lucide-react';

export default function ScheduleForm({ schedule, onBack, onSuccess }) {
  const isEditing = !!schedule;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize state directly from the prop if it exists
  const [formData, setFormData] = useState({
    schedule_ID: schedule?.schedule_ID || '',
    subject_Code: schedule?.subject_Code || '',
    section_ID: schedule?.section_ID || '',
    professor_ID: schedule?.professor_ID || '',
    room_ID: schedule?.room_ID || '',
    time_Start: schedule?.time_Start || '',
    time_End: schedule?.time_End || '',
    class_Days: schedule?.class_Days || ''
  });

  // THE FIX: Derived State Pattern instead of useEffect
  const [prevSchedule, setPrevSchedule] = useState(schedule);
  
  if (schedule !== prevSchedule) {
    setPrevSchedule(schedule);
    setFormData({
      schedule_ID: schedule?.schedule_ID || '',
      subject_Code: schedule?.subject_Code || '',
      section_ID: schedule?.section_ID || '',
      professor_ID: schedule?.professor_ID || '',
      room_ID: schedule?.room_ID || '',
      time_Start: schedule?.time_Start || '',
      time_End: schedule?.time_End || '',
      class_Days: schedule?.class_Days || ''
    });
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const url = isEditing 
        ? `http://localhost:5106/api/schedules/${formData.schedule_ID}` 
        : 'http://localhost:5106/api/schedules';
    
    const method = isEditing ? 'PUT' : 'POST';

    // Auto-generate ID for creation if needed
    let payload = { ...formData };
    if (!isEditing && !payload.schedule_ID) {
      payload.schedule_ID = "SCH-" + Math.floor(1000 + Math.random() * 9000).toString();
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert("Failed to save schedule. Ensure all IDs (Subject, Section, Room, Prof) exist in the database.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              {isEditing ? <><Edit2 className="text-amber-500" /> Edit Schedule</> : <><CalendarPlus className="text-blue-600" /> Create Schedule</>}
            </h2>
            <p className="text-sm font-bold text-slate-500">
              {isEditing ? 'Update the timetable details.' : 'Assign a new subject, faculty, and room to a section.'}
            </p>
          </div>
        </div>
        {isEditing && <span className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-xl font-black text-xs tracking-widest border border-amber-200">EDIT MODE</span>}
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Read-only ID if Editing */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Schedule ID</label>
              <input 
                type="text" name="schedule_ID" value={formData.schedule_ID} onChange={handleChange}
                placeholder="Auto-generated if left blank" disabled={isEditing}
                className={`w-full px-4 py-3 border rounded-xl outline-none font-bold ${isEditing ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-700'}`} 
              />
            </div>

            {/* Core Relationships */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject Code <span className="text-rose-500">*</span></label>
              <input required type="text" name="subject_Code" value={formData.subject_Code} onChange={handleChange} placeholder="e.g. IT301" className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Section ID <span className="text-rose-500">*</span></label>
              <input required type="text" name="section_ID" value={formData.section_ID} onChange={handleChange} placeholder="e.g. SEC-001" className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Professor ID</label>
              <input type="text" name="professor_ID" value={formData.professor_ID} onChange={handleChange} placeholder="e.g. USR-1234 (Optional)" className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Room ID</label>
              <input type="text" name="room_ID" value={formData.room_ID} onChange={handleChange} placeholder="e.g. RM-101 (Optional)" className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
            </div>

            {/* Time and Days */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Days</label>
                <input type="text" name="class_Days" value={formData.class_Days} onChange={handleChange} placeholder="e.g. Mon/Wed/Fri" className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time Start</label>
                <input type="text" name="time_Start" value={formData.time_Start} onChange={handleChange} placeholder="e.g. 08:00 AM" className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time End</label>
                <input type="text" name="time_End" value={formData.time_End} onChange={handleChange} placeholder="e.g. 10:00 AM" className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={isSubmitting} className={`px-8 py-3 font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 ${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
               <Save size={18}/> {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Schedule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}