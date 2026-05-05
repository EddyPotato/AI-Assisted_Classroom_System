import { useState } from 'react';
import { Edit2, ArrowLeft, Save, Lightbulb } from 'lucide-react';
import StaffFormFields from './StaffFormFields';
import FaceRegistrationCamera from "../enrollment/FaceRegistrationCamera";

export default function EditStaffView({ staff, onBack, onSuccess, onShowToast }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImageBlob, setCapturedImageBlob] = useState(null);
  
  const [formData, setFormData] = useState({
    user_ID: '', first_Name: '', middle_Name: '', last_Name: '', role: 'Faculty', password: '',
    email: '', contact_Number: '', address: '', status: 'Active'
  });

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
        password: '', 
        email: staff.email || '',
        contact_Number: staff.contact_Number || '',
        address: staff.address || '',
        status: staff.status || 'Active'
      });
      setCapturedImageBlob(null);
    }
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const [cacheBuster] = useState(() => Date.now());
  const existingImageUrl = staff?.face_Reference_Path 
    ? `http://localhost:5106/ReferenceFaces/${staff.face_Reference_Path}?t=${cacheBuster}` 
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submitData = new FormData();
    submitData.append('First_Name', formData.first_Name);
    submitData.append('Middle_Name', formData.middle_Name);
    submitData.append('Last_Name', formData.last_Name);
    submitData.append('Role', formData.role);
    submitData.append('Email', formData.email);
    submitData.append('Contact_Number', formData.contact_Number);
    submitData.append('Address', formData.address);
    submitData.append('Status', formData.status);
    
    if (formData.password) submitData.append('Password', formData.password);
    if (capturedImageBlob) submitData.append('Photo', capturedImageBlob, 'staff_face.jpg');

    try {
      const response = await fetch(`http://localhost:5106/api/user/${formData.user_ID}`, { 
        method: 'PUT', body: submitData
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
            <p className="text-sm font-bold text-slate-500">Update account details or reset biometric data.</p>
          </div>
        </div>
        <span className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-xl font-black text-xs tracking-widest border border-amber-200">EDIT MODE</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
            
            <div className="xl:col-span-5 flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Account Details</h3>
                <StaffFormFields formData={formData} handleChange={handleChange} isEditing={true} />
              </div>
              
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 mt-auto">
                <p className="text-sm text-amber-800 font-medium">
                  <strong>Security Note:</strong> Leave the System Password field blank unless you wish to overwrite their current password.
                </p>
              </div>
            </div>

            <div className="xl:col-span-7 xl:border-l xl:border-slate-100 xl:pl-10">
               <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2">Update Biometrics (Optional)</h3>
               <FaceRegistrationCamera 
                 isOpen={true} 
                 onCapture={(blob) => setCapturedImageBlob(blob)} 
                 onClear={() => setCapturedImageBlob(null)} 
                 existingImageUrl={existingImageUrl} 
               />
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