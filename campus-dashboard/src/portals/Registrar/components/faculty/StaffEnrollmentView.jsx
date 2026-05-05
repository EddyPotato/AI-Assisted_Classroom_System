import { useState } from 'react';
import { UserPlus, ArrowLeft, ShieldCheck, CheckCircle2, Upload, Lightbulb } from 'lucide-react';
import StaffFormFields from './StaffFormFields';
import FaceRegistrationCamera from '../enrollment/FaceRegistrationCamera';

export default function StaffEnrollmentView({ onBack, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImageBlob, setCapturedImageBlob] = useState(null);
  const [successData, setSuccessData] = useState(null);
  
  const [formData, setFormData] = useState({
    user_ID: '', first_Name: '', middle_Name: '', last_Name: '', role: 'Faculty', password: '',
    email: '', contact_Number: '', address: '', status: 'Active'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!capturedImageBlob) return alert("Please capture a face reference photo for the staff member.");
    setIsSubmitting(true);
    
    const submitData = new FormData();
    submitData.append('User_ID', formData.user_ID);
    submitData.append('First_Name', formData.first_Name);
    submitData.append('Middle_Name', formData.middle_Name);
    submitData.append('Last_Name', formData.last_Name);
    submitData.append('Role', formData.role);
    submitData.append('Password', formData.password);
    submitData.append('Email', formData.email);
    submitData.append('Contact_Number', formData.contact_Number);
    submitData.append('Address', formData.address);
    submitData.append('Status', formData.status);
    submitData.append('Photo', capturedImageBlob, 'staff_face.jpg');

    try {
      const response = await fetch('http://localhost:5106/api/user', {
        method: 'POST',
        body: submitData 
      });
        
      if (response.ok) {
        const data = await response.json();
        setSuccessData({ name: `${formData.first_Name} ${formData.last_Name}`, role: formData.role, id: data.assignedId || formData.user_ID });
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
          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">{successData.role} ID</p>
          <p className="text-3xl font-black text-blue-700 font-mono tracking-tight">{successData.id}</p>
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
          <p className="text-sm font-bold text-slate-500">Create a system account and capture biometric data.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
            
            <div className="xl:col-span-5 flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Account Details</h3>
                <StaffFormFields formData={formData} handleChange={handleChange} isEditing={false} />
              </div>
              
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 mt-auto">
                 <h5 className="font-black text-amber-800 flex items-center gap-2 mb-3 text-sm">
                   <Lightbulb size={18} className="text-amber-400 fill-amber-400"/> Biometric Photo Guide
                 </h5>
                 <ul className="text-sm font-medium text-slate-600 space-y-2 list-disc pl-4">
                   <li>Ensure the face fills the <strong className="text-slate-800">dashed oval guide</strong>.</li>
                   <li>Look directly at the camera.</li>
                   <li>Remove <strong className="text-rose-600">glasses</strong>, hats, or masks.</li>
                 </ul>
              </div>
            </div>

            <div className="xl:col-span-7 xl:border-l xl:border-slate-100 xl:pl-10">
              <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2">Biometric Registration</h3>
              <FaceRegistrationCamera isOpen={true} onCapture={(blob) => setCapturedImageBlob(blob)} onClear={() => setCapturedImageBlob(null)} />
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={isSubmitting || !capturedImageBlob} className="px-8 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95">
               <Upload size={18}/> {isSubmitting ? 'Processing...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}