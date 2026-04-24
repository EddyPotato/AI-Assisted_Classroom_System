import { Edit2, BookOpen, Database } from 'lucide-react';

export default function ScheduleForm({ formData, isEditing, handleChange, handleCancelForm, requestSave }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-lg shadow-blue-100/50 animate-in slide-in-from-top-4">
      <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
        {isEditing ? <Edit2 size={20} className="text-amber-500"/> : <BookOpen size={20} className="text-blue-500" />} 
        {isEditing ? `Edit Schedule: ${formData.schedule_ID}` : 'New Class Section'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
          <select name="subject_Code" onChange={handleChange} value={formData.subject_Code} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-sm">
            <option value="" disabled>-- Select Subject --</option>
            <option value="IM101">IM101 - Advance Database Systems</option>
            <option value="IPT101">IPT101 - Integrative Programming</option>
            <option value="SE101">SE101 - Software Engineering</option>
            <option value="HCI101">HCI101 - Human Computer Interaction</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Section Block</label>
          <select name="section_ID" onChange={handleChange} value={formData.section_ID} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-sm">
            <option value="" disabled>-- Select Section --</option>
            <option value="SEC-001">SBIT2A (SB Campus)</option>
            <option value="SEC-002">SBIT2B (SB Campus)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assigned Professor</label>
          <select name="professor_ID" onChange={handleChange} value={formData.professor_ID} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-sm">
            <option value="" disabled>-- Select Professor --</option>
            <option value="PRO-0001">Joel Olayon</option>
            <option value="PRO-0002">Darrel Datoon</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Facility / Room</label>
          <select name="room_ID" onChange={handleChange} value={formData.room_ID} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-sm">
            <option value="" disabled>-- Select Room --</option>
            <option value="IL-602">IL-602 (New Academic Building)</option>
            <option value="IL-703">IL-703 (New Academic Building)</option>
            <option value="IK-504">IK-504 (Bautista Building)</option>
            <option value="IK-604">IK-604 (Bautista Building)</option>
          </select>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time Start</label>
            <input type="time" name="time_Start" onChange={handleChange} value={formData.time_Start} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time End</label>
            <input type="time" name="time_End" onChange={handleChange} value={formData.time_End} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class Days</label>
          <input type="text" name="class_Days" onChange={handleChange} value={formData.class_Days} placeholder="e.g. Monday, Wednesday" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-sm" />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
         <button onClick={handleCancelForm} className="font-bold py-2 px-4 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          Cancel
        </button>
        <button onClick={requestSave} className={`text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2 ${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {isEditing ? <Edit2 size={16}/> : <Database size={16}/>}
          {isEditing ? 'Update Schedule' : 'Save to Oracle'}
        </button>
      </div>
    </div>
  );
}