import { useState } from 'react'; // THE FIX: Removed useEffect
import { Edit2, ArrowLeft, Save, ShieldCheck } from 'lucide-react';
import StaffFormFields from './StaffFormFields';

export default function EditStaffView({ staff, onBack, onSuccess, onShowToast }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    user_ID: '', first_Name: '', middle_Name: '', last_Name: '', role: 'Faculty', password: ''
  });

  // THE FIX: Derived State Pattern. 
  // This safely syncs the incoming 'staff' prop to the local 'formData' state
  // without triggering a cascading double-render!
  const [prevStaff, setPrevStaff] = useState(null);
  
  if (staff !== prevStaff) {
    setPrevStaff(staff);
    if (staff) {
      setFormData({
        user_ID: staff.user_ID || '',
        first_Name: staff.first_Name || '',
        middle_Name: staff.middle_Name || '',
        last_Name: staff.last_Name || '',
        role: staff.role || 'Faculty',
        password: '' // Deliberately blank so we don't send hashes back
      });
    }
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`http://localhost:5106/api/user/${formData.user_ID}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
        
      if (response.ok) {
        onSuccess(); 
        onShowToast(`${formData.first_Name} ${formData.last_Name}'s account updated!`);
        onBack(); 
      } else {
        const errData = await response.json();
        let errorMessage = errData.message || (errData.errors ? Object.values(errData.errors).flat().join('\n') : "400 Bad Request");
        alert(`Error:\n${errorMessage}`);
      }
    } catch {
      alert("Network error connecting to API.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-10">
      <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 transition-all shadow-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Edit2 className="text-amber-500" /> Edit Staff Record
            </h2>
            <p className="text-sm font-bold text-slate-500">Update account details or reset password.</p>
          </div>
        </div>
        <span className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-xl font-black text-xs tracking-widest border border-amber-200">EDIT MODE</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
            
            <div className="xl:col-span-6 flex flex-col gap-6">
              <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2">Account Details</h3>
              <StaffFormFields formData={formData} handleChange={handleChange} isEditing={true} />
            </div>

            <div className="xl:col-span-6 xl:border-l xl:border-slate-100 xl:pl-10">
               <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 h-full flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><ShieldCheck size={24} /></div>
                  <h3 className="text-xl font-black text-amber-900">Security Notice</h3>
                </div>
                
                <div className="space-y-4 text-sm text-amber-800 font-medium">
                  <p>You are editing an active system account.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Changing the <strong>Role</strong> will immediately alter the menus and data this user can access upon their next login.</li>
                    <li>If you leave the <strong>System Password</strong> field blank, their existing password will remain unchanged.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95">
               <Save size={18}/> {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}