import { useState } from 'react';
import { Edit2, ArrowLeft, Save, Lightbulb } from 'lucide-react';
import StudentFormFields from './StudentFormFields';
import FaceRegistrationCamera from './FaceRegistrationCamera';

export default function EditStudentView({ student, onBack, onSuccess, onShowToast }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImageBlob, setCapturedImageBlob] = useState(null);
  const [formData, setFormData] = useState({
    student_ID: '', first_Name: '', middle_Name: '', last_Name: '', enrollment_Status: 'Regular',
    contact_Number: '', birthday: '', address: ''
  });

  const [prevStudent, setPrevStudent] = useState(null);
  
  if (student !== prevStudent) {
    setPrevStudent(student); 
    if (student) {
      setFormData({
        student_ID: student.student_ID || '',
        first_Name: student.first_Name || '',
        middle_Name: student.middle_Name || '',
        last_Name: student.last_Name || '',
        enrollment_Status: student.enrollment_Status || 'Regular',
        contact_Number: student.contact_Number || '',
        birthday: student.birthday || '',
        address: student.address || ''
      });
      setCapturedImageBlob(null);
    }
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Lazy initialize timestamp so it only fires once per edit session
  const [cacheBuster] = useState(() => Date.now());

  // Compute the existing image URL to show in the camera box
  const existingImageUrl = student?.face_Reference_Path ? `http://localhost:5106/ReferenceFaces/${student.face_Reference_Path}?t=${cacheBuster}` : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submitData = new FormData();
    submitData.append('First_Name', formData.first_Name);
    submitData.append('Middle_Name', formData.middle_Name);
    submitData.append('Last_Name', formData.last_Name);
    submitData.append('Enrollment_Status', formData.enrollment_Status);
    submitData.append('Contact_Number', formData.contact_Number);
    submitData.append('Birthday', formData.birthday);
    submitData.append('Address', formData.address);
    
    if (capturedImageBlob) {
      submitData.append('Photo', capturedImageBlob, 'face.jpg');
    }

    try {
      const response = await fetch(`http://localhost:5106/api/student/${formData.student_ID}`, { 
        method: 'PUT', body: submitData 
      });
        
      if (response.ok) {
        onSuccess(); 
        onShowToast(`Student ${formData.first_Name} ${formData.last_Name} updated successfully!`);
        onBack(); 
      } else {
        const errData = await response.json();
        let errorMessage = errData.message;
        if (!errorMessage && errData.errors) {
            errorMessage = Object.values(errData.errors).flat().join('\n');
        }
        alert(`Error:\n${errorMessage || "400 Bad Request"}`);
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
                <Edit2 className="text-amber-500" /> Edit Student Record
            </h2>
            <p className="text-sm font-bold text-slate-500">Update biographical data or recapture biometric face reference.</p>
            </div>
        </div>
        <span className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-xl font-black text-xs tracking-widest border border-amber-200">EDIT MODE</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <form id="editForm" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
            
            <div className="xl:col-span-5 flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Student Information</h3>
                <StudentFormFields formData={formData} handleChange={handleChange} isEditing={true} />
              </div>

              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 mt-auto">
                <h5 className="font-black text-amber-800 flex items-center gap-2 mb-3 text-sm">
                  <Lightbulb size={18} className="text-amber-400 fill-amber-400"/> Biometric Photo Guide
                </h5>
                <ul className="text-sm font-medium text-slate-600 space-y-2 list-disc pl-4">
                  <li>Ensure the face fills the <strong className="text-slate-800">dashed oval guide</strong>.</li>
                  <li>Look directly at the camera.</li>
                  <li>Remove <strong className="text-rose-600">glasses</strong>, hats, or masks.</li>
                  <li>Ensure the lighting indicates <strong className="text-emerald-600">Good Lighting</strong>.</li>
                </ul>
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