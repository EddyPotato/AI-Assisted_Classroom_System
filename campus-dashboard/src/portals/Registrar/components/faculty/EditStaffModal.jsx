import { useState } from 'react';
import { X, Save, Edit } from 'lucide-react';

export default function EditStaffModal({ isOpen, staff, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    user_ID: '', first_Name: '', middle_Name: '', last_Name: '', role: 'Faculty'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevStaff, setPrevStaff] = useState(null);

  // THE FIX 1: Update state during render instead of useEffect
  // This satisfies ESLint's 'set-state-in-effect' rule perfectly
  if (staff !== prevStaff) {
    setPrevStaff(staff);
    if (staff) {
      setFormData({
        user_ID: staff.user_ID || '',
        first_Name: staff.first_Name || '',
        middle_Name: staff.middle_Name || '',
        last_Name: staff.last_Name || '',
        role: staff.role || 'Faculty'
      });
    }
  }

  if (!isOpen || !staff) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:5106/api/staff/${formData.user_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (err) {
      // THE FIX 2: We now log the error to satisfy 'no-unused-vars'
      console.error("Update error:", err); 
      alert("Failed to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><Edit size={20} /></div>
            <h3 className="text-xl font-black text-slate-800">Edit Staff Profile</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Employee ID (Cannot be changed)</label>
              <input readOnly type="text" name="user_ID" value={formData.user_ID} className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg outline-none text-slate-500 font-mono font-bold cursor-not-allowed" />
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role / Department</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-700">
                <option value="Faculty">Faculty (Professor)</option>
                <option value="Registrar">Registrar (HR)</option>
                <option value="Guard">Campus Guard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name *</label>
              <input required type="text" name="first_Name" value={formData.first_Name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Middle Name</label>
              <input type="text" name="middle_Name" value={formData.middle_Name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name *</label>
              <input required type="text" name="last_Name" value={formData.last_Name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50">
              <Save size={18} /> {isSubmitting ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}