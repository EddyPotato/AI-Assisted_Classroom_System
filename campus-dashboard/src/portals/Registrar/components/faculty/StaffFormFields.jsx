import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function StaffFormFields({ formData, handleChange, isEditing }) {
  const [showPassword, setShowPassword] = useState(false);

  // THE FIX: Auto-formats the phone number to 4-3-4 (e.g., 0912 345 6789)
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // Strip all non-digits
    if (val.length > 11) val = val.substring(0, 11); // Max 11 digits

    let formatted = val;
    if (val.length > 4 && val.length <= 7) {
      formatted = `${val.slice(0, 4)} ${val.slice(4)}`;
    } else if (val.length > 7) {
      formatted = `${val.slice(0, 4)} ${val.slice(4, 7)} ${val.slice(7)}`;
    }

    // Send the formatted string back to the parent's handleChange
    handleChange({ target: { name: 'contact_Number', value: formatted } });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 sm:col-span-1">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">User ID</label>
        <input 
          type="text" 
          name="user_ID" 
          value={formData.user_ID} 
          onChange={handleChange} 
          placeholder="Auto-generated" 
          disabled={isEditing}
          className={`w-full px-3 py-2 border rounded-lg outline-none font-bold ${
            isEditing ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-700'
          }`} 
        />
      </div>

      <div className="col-span-2 sm:col-span-1">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role <span className="text-rose-500 ml-0.5">*</span></label>
        <select required name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700">
          <option value="Faculty">Faculty</option>
          <option value="Guard">Guard</option>
          <option value="Registrar">Registrar</option>
          {/* THE FIX: Unified Admin/Principal into just Principal */}
          <option value="Principal">Principal</option>
        </select>
      </div>

      {/* THE FIX: Dynamic Security Warning for Top-Level Roles */}
      {formData.role === 'Principal' && (
        <div className="col-span-2 bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
          <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-bold text-rose-800">High-Level Access Warning</p>
            <p className="text-xs font-medium text-rose-600 mt-0.5">
              The Principal role has unrestricted access to the entire system. In production, only an existing Principal should be allowed to create or modify this role.
            </p>
          </div>
        </div>
      )}

      <div className="col-span-2 sm:col-span-1">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name <span className="text-rose-500 ml-0.5">*</span></label>
        <input required type="text" name="first_Name" value={formData.first_Name} onChange={handleChange} placeholder="e.g. Maria" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
      </div>

      <div className="col-span-2 sm:col-span-1">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name <span className="text-rose-500 ml-0.5">*</span></label>
        <input required type="text" name="last_Name" value={formData.last_Name} onChange={handleChange} placeholder="e.g. Santos" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
      </div>

      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Middle Name</label>
        <input type="text" name="middle_Name" value={formData.middle_Name} onChange={handleChange} placeholder="e.g. Reyes (Optional)" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
      </div>

      <div className="col-span-2 sm:col-span-1">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="staff@campus.edu.ph" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
      </div>

      <div className="col-span-2 sm:col-span-1">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label>
        <input 
          type="text" 
          name="contact_Number" 
          value={formData.contact_Number} 
          onChange={handlePhoneChange} 
          placeholder="09XX XXX XXXX" 
          className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" 
        />
      </div>

      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
        <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="House No., Street, Barangay, City" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
      </div>

      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">System Password {isEditing ? '' : <span className="text-rose-500 ml-0.5">*</span>}</label>
        <div className="relative">
          <input 
            required={!isEditing}
            type={showPassword ? "text" : "password"} 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            placeholder={isEditing ? "Leave blank to keep current password" : "Enter a secure login password"} 
            className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" 
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}