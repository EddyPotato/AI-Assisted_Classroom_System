import { useState } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import StudentFormFields from './StudentFormFields';
import FaceRegistrationCamera from './FaceRegistrationCamera';

export default function StudentEnrollmentModal({ isOpen, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImageBlob, setCapturedImageBlob] = useState(null);
  
  const initialFormState = {
    student_ID: '', first_Name: '', middle_Name: '', last_Name: '', enrollment_Status: 'Regular'
  };
  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!capturedImageBlob) return alert("Please capture a face reference photo.");

    setIsSubmitting(true);
    
    // Prepare Multipart Form Data for C# Backend
    const submitData = new FormData();
    submitData.append('Student_ID', formData.student_ID);
    submitData.append('First_Name', formData.first_Name);
    submitData.append('Middle_Name', formData.middle_Name);
    submitData.append('Last_Name', formData.last_Name);
    submitData.append('Enrollment_Status', formData.enrollment_Status);
    submitData.append('Photo', capturedImageBlob, 'face.jpg');

    try {
      const response = await fetch('http://localhost:5106/api/student', { 
        method: 'POST', 
        body: submitData 
      });
      
      if (response.ok) {
        setFormData(initialFormState);
        setCapturedImageBlob(null);
        onSuccess(); // Refresh the table
        onClose();   // Close the modal
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

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Camera className="text-blue-600" /> Enroll New Student</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={24}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="enrollForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* The Extracted Dumb Component */}
            <StudentFormFields formData={formData} handleChange={handleChange} />
            
            {/* The Extracted Hardware Component */}
            <FaceRegistrationCamera 
               isOpen={isOpen} 
               onCapture={(blob) => setCapturedImageBlob(blob)} 
               onClear={() => setCapturedImageBlob(null)} 
            />

          </form>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-200 rounded-lg">Cancel</button>
          <button form="enrollForm" type="submit" disabled={isSubmitting || !capturedImageBlob} className="px-6 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all disabled:opacity-50 flex items-center gap-2">
             <Upload size={18}/> {isSubmitting ? 'Saving...' : 'Enroll & Save Data'}
          </button>
        </div>
        
      </div>
    </div>
  );
}