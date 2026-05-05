import { useState } from 'react';
import { UserPlus, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import StaffFormFields from './StaffFormFields';

export default function StaffEnrollmentView({ onBack, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  const [formData, setFormData] = useState({
    user_ID: '', first_Name: '', middle_Name: '', last_Name: '', role: 'Faculty', password: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Note: Adjust API endpoint to match your C# User Controller
    try {
      const response = await fetch('http://localhost:5106/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
        
      if (response.ok) {
        setSuccessData({ name: `${formData.first_Name} ${formData.last_Name}`, role: formData.role });
        onSuccess(); 
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

  if (successData) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] animate-in zoom-in-95 duration-500">
        <CheckCircle2 size={80} className="text-emerald-500 mb-6" />
        <h2 className="text-4xl font-black text-slate-800 mb-2">Staff Registered!</h2>
        <p className="text-lg text-slate-500 font-medium mb-8">{successData.name} was added to the system.</p>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center mb-8 shadow-sm">
          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">Assigned Role</p>
          <p className="text-3xl font-black text-blue-700 tracking-tight">{successData.role}</p>
        </div>
        <button onClick={onBack} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95">
          Return to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-10">
      <div className="flex items-center gap-4 mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <UserPlus className="text-blue-600" /> Register New Staff
          </h2>
          <p className="text-sm font-bold text-slate-500">Create a new system account for faculty or administrative personnel.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
            
            <div className="xl:col-span-6 flex flex-col gap-6">
              <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2">Account Details</h3>
              <StaffFormFields formData={formData} handleChange={handleChange} isEditing={false} />
            </div>

            <div className="xl:col-span-6 xl:border-l xl:border-slate-100 xl:pl-10">
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 h-full flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><ShieldCheck size={24} /></div>
                  <h3 className="text-xl font-black text-indigo-900">Role Permissions Guide</h3>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <p className="font-black text-slate-800 mb-1">Faculty</p>
                    <p className="text-slate-500 font-medium">Can view assigned schedules, launch the Room Dashboard, and manage class attendance logs.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <p className="font-black text-slate-800 mb-1">Registrar</p>
                    <p className="text-slate-500 font-medium">Full access to Student and Staff directories, schedules, and face biometric registrations.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <p className="font-black text-slate-800 mb-1">Guard</p>
                    <p className="text-slate-500 font-medium">Restricted access to the live security feed and manual campus entry override tools.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95">
               <ShieldCheck size={18}/> {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}