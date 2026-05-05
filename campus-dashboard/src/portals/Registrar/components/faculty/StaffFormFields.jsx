import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function StaffFormFields({ formData, handleChange, isEditing }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 sm:col-span-1">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">User ID</label>
        <input 
          type="text" 
          name="user_ID" 
          value={formData.user_ID} 
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

      <div className="col-span-2 sm:col-span-1">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          Role <span className="text-rose-500 ml-0.5">*</span>
        </label>
        <select required name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700">
          <option value="Faculty">Faculty</option>
          <option value="Guard">Guard</option>
          <option value="Registrar">Registrar</option>
          <option value="Principal">Principal</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          First Name <span className="text-rose-500 ml-0.5">*</span>
        </label>
        <input required type="text" name="first_Name" value={formData.first_Name} onChange={handleChange} placeholder="e.g. Maria" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
      </div>

      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Middle Name</label>
        <input type="text" name="middle_Name" value={formData.middle_Name} onChange={handleChange} placeholder="e.g. Santos" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
      </div>
      
      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          Last Name <span className="text-rose-500 ml-0.5">*</span>
        </label>
        <input required type="text" name="last_Name" value={formData.last_Name} onChange={handleChange} placeholder="e.g. Garcia" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" />
      </div>

      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          System Password {isEditing ? '' : <span className="text-rose-500 ml-0.5">*</span>}
        </label>
        <div className="relative">
          <input 
            required={!isEditing}
            type={showPassword ? "text" : "password"} 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            placeholder={isEditing ? "Leave blank to keep current password" : "Secure login password"} 
            className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" 
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}