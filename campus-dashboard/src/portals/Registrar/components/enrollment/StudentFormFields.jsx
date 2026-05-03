export default function StudentFormFields({ formData, handleChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student ID</label>
        <input type="text" name="student_ID" value={formData.student_ID} onChange={handleChange} placeholder="Leave blank to auto-generate" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
        <select name="enrollment_Status" value={formData.enrollment_Status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700">
          <option value="Regular">Regular Student</option>
          <option value="Irregular">Irregular Student</option>
          <option value="Dropped">Dropped</option>
          <option value="Expelled">Expelled</option>
          <option value="Graduated">Graduated</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name *</label>
        <input required type="text" name="first_Name" value={formData.first_Name} onChange={handleChange} placeholder="e.g. Juan" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Middle Name</label>
        <input type="text" name="middle_Name" value={formData.middle_Name} onChange={handleChange} placeholder="e.g. Reyes" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      
      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name *</label>
        <input required type="text" name="last_Name" value={formData.last_Name} onChange={handleChange} placeholder="e.g. Dela Cruz" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label>
        <input type="text" name="contact_Number" value={formData.contact_Number || ''} onChange={handleChange} placeholder="+63 9xx-xxx-xxxx" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Birthday</label>
        <input type="date" name="birthday" value={formData.birthday || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-700" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
        <input type="text" name="address" value={formData.address || ''} onChange={handleChange} placeholder="House #, Street, City, Country" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>
  );
}