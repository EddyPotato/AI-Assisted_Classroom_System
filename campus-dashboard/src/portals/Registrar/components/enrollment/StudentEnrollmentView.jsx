import { useState } from 'react';
import { Camera, ArrowLeft, Upload, CheckCircle2, Lightbulb } from 'lucide-react';
import StudentFormFields from './StudentFormFields';
import FaceRegistrationCamera from './FaceRegistrationCamera';

export default function StudentEnrollmentView({ onBack, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImageBlob, setCapturedImageBlob] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const initialFormState = {
    student_ID: '', first_Name: '', middle_Name: '', last_Name: '', enrollment_Status: 'Regular',
    contact_Number: '', birthday: '', address: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!capturedImageBlob) return alert("Please capture a face reference photo.");
    setIsSubmitting(true);
    
    const submitData = new FormData();
    submitData.append('Student_ID', formData.student_ID);
    submitData.append('First_Name', formData.first_Name);
    submitData.append('Middle_Name', formData.middle_Name);
    submitData.append('Last_Name', formData.last_Name);
    submitData.append('Enrollment_Status', formData.enrollment_Status);
    submitData.append('Contact_Number', formData.contact_Number);
    submitData.append('Birthday', formData.birthday);
    submitData.append('Address', formData.address);
    submitData.append('Photo', capturedImageBlob, 'face.jpg');

    try {
      const response = await fetch('http://localhost:5106/api/student', {
        method: 'POST',
        body: submitData 
      });
        
      if (response.ok) {
        const data = await response.json();
        const finalId = data.assignedId || formData.student_ID;
        setSuccessData({ name: `${formData.first_Name} ${formData.last_Name}`, id: finalId });
        onSuccess(); 
      } else {
        const errData = await response.json();
        alert(`Error: ${errData.message}`);
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
              <h2 className="text-4xl font-black text-slate-800 mb-2">Enrollment Successful!</h2>
              <p className="text-lg text-slate-500 font-medium mb-8">{successData.name} has been added to the system.</p>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center mb-8 shadow-sm">
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">Assigned Student ID</p>
                  <p className="text-5xl font-black text-blue-700 font-mono tracking-tight">{successData.id}</p>
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
            <Camera className="text-blue-600" /> Enroll New Student
          </h2>
          <p className="text-sm font-bold text-slate-500">Complete the form and capture face data to register a new student.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <form id="enrollForm" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
            <div className="xl:col-span-5 flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Student Information</h3>
                <StudentFormFields formData={formData} handleChange={handleChange} />
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
              <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2">Biometric Registration</h3>
              <FaceRegistrationCamera isOpen={true} onCapture={(blob) => setCapturedImageBlob(blob)} onClear={() => setCapturedImageBlob(null)} />
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={isSubmitting || !capturedImageBlob} className="px-8 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95">
               <Upload size={18}/> {isSubmitting ? 'Processing...' : 'Complete Enrollment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}