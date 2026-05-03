export default function StudentFormFields({ formData, handleChange, isEditing }) {
  
  // THE FIX: Intercept the phone input to force the 4-3-4 spacing format
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // Strip all non-numbers
    if (val.length > 11) val = val.substring(0, 11); // Max 11 digits

    let formatted = val;
    if (val.length > 4 && val.length <= 7) {
      formatted = `${val.slice(0, 4)} ${val.slice(4)}`;
    } else if (val.length > 7) {
      formatted = `${val.slice(0, 4)} ${val.slice(4, 7)} ${val.slice(7)}`;
    }

    // Pass the formatted value back to the parent's handleChange
    handleChange({
      target: { name: 'contact_Number', value: formatted }
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Optional: Auto-generated */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student ID</label>
        <input 
          type="text" 
          name="student_ID" 
          value={formData.student_ID} 
          onChange={handleChange} 
          placeholder="Leave blank to auto-generate" 
          disabled={isEditing}
          className={`w-full px-3 py-2 border rounded-lg outline-none font-bold ${
            isEditing 
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
              : 'border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-700'
          }`} 
        />
      </div>

      {/* Always requires a selection, defaults to Regular */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          Status <span className="text-rose-500 ml-0.5">*</span>
        </label>
        <select required name="enrollment_Status" value={formData.enrollment_Status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700">
          <option value="Regular">Regular Student</option>
          <option value="Irregular">Irregular Student</option>
          <option value="Dropped">Dropped</option>
          <option value="Expelled">Expelled</option>
          <option value="Graduated">Graduated</option>
        </select>
      </div>

      {/* Required */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          First Name <span className="text-rose-500 ml-0.5">*</span>
        </label>
        <input required type="text" name="first_Name" value={formData.first_Name} onChange={handleChange} placeholder="e.g. Juan" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
      </div>

      {/* Optional: Some people don't have middle names */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Middle Name</label>
        <input type="text" name="middle_Name" value={formData.middle_Name} onChange={handleChange} placeholder="e.g. Reyes" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
      </div>
      
      {/* Required */}
      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          Last Name <span className="text-rose-500 ml-0.5">*</span>
        </label>
        <input required type="text" name="last_Name" value={formData.last_Name} onChange={handleChange} placeholder="e.g. Dela Cruz" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
      </div>

      {/* Required: Custom Phone Formatter applied here */}
      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          Contact Number <span className="text-rose-500 ml-0.5">*</span>
        </label>
        <input 
          required 
          type="text" 
          name="contact_Number" 
          value={formData.contact_Number || ''} 
          onChange={handlePhoneChange} 
          placeholder="09XX XXX XXXX" 
          maxLength={13} // 11 digits + 2 spaces
          className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 font-mono tracking-wide" 
        />
      </div>

      {/* Required */}
      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          Birthday <span className="text-rose-500 ml-0.5">*</span>
        </label>
        <input required type="date" name="birthday" value={formData.birthday || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
      </div>

      {/* Required */}
      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          Address <span className="text-rose-500 ml-0.5">*</span>
        </label>
        <input required type="text" name="address" value={formData.address || ''} onChange={handleChange} placeholder="House #, Street, City, Country" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
      </div>
    </div>
  );
}