export default function StudentFormFields({ formData, handleChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student ID</label>
        {/* THE FIX: Removed 'required' and updated the placeholder */}
        <input 
          type="text" 
          name="student_ID" 
          value={formData.student_ID} 
          onChange={handleChange} 
          placeholder="Leave blank to auto-generate" 
          className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" 
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
        <select name="enrollment_Status" value={formData.enrollment_Status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-bold text-slate-700">
          <option value="Regular">Regular Student</option>
          <option value="Irregular">Irregular Student</option>
          <option value="Dropped">Dropped</option>
          <option value="Expelled">Expelled</option>
          <option value="Graduated">Graduated</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name *</label>
        <input required type="text" name="first_Name" value={formData.first_Name} onChange={handleChange} placeholder="e.g. Juan" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Middle Name</label>
        <input type="text" name="middle_Name" value={formData.middle_Name} onChange={handleChange} placeholder="e.g. Reyes" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
      </div>
      <div className="col-span-2 sm:col-span-1">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name *</label>
        <input required type="text" name="last_Name" value={formData.last_Name} onChange={handleChange} placeholder="e.g. Dela Cruz" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
      </div>
    </div>
  );
}