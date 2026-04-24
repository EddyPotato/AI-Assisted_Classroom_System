import { useState } from 'react';
import { Edit2, X, Save } from 'lucide-react';
import StudentFormFields from './StudentFormFields';
import FaceRegistrationCamera from './FaceRegistrationCamera';

export default function EditStudentModal({ isOpen, onClose, onSuccess, student }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImageBlob, setCapturedImageBlob] = useState(null);
  
  const [formData, setFormData] = useState({
    student_ID: '', first_Name: '', middle_Name: '', last_Name: '', enrollment_Status: 'Regular'
  });

  // THE FIX: Reset form state when the 'student' prop changes using state-during-render.
  // This completely eliminates the useEffect cascading render error.
  const [prevStudent, setPrevStudent] = useState(null);

  if (student !== prevStudent) {
    setPrevStudent(student);
    if (student) {
      setFormData({
        student_ID: student.student_ID || '',
        first_Name: student.first_Name || '',
        middle_Name: student.middle_Name || '',
        last_Name: student.last_Name || '',
        enrollment_Status: student.enrollment_Status || 'Regular'
      });
      setCapturedImageBlob(null);
    }
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Prepare Multipart Form Data for C# Backend
    const submitData = new FormData();
    submitData.append('First_Name', formData.first_Name);
    submitData.append('Middle_Name', formData.middle_Name);
    submitData.append('Last_Name', formData.last_Name);
    submitData.append('Enrollment_Status', formData.enrollment_Status);
    
    // Only append a photo if the user actually took a new one!
    if (capturedImageBlob) {
      submitData.append('Photo', capturedImageBlob, 'face.jpg');
    }

    try {
      const response = await fetch(`http://localhost:5106/api/student/${formData.student_ID}`, { 
        method: 'PUT', 
        body: submitData 
      });
      
      if (response.ok) {
        setCapturedImageBlob(null);
        onSuccess(); 
        onClose();   
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

  if (!isOpen || !student) return null;

  return (
    // THE FIX: Changed z-[70] to the canonical z-70 Tailwind class
    <div className="absolute inset-0 z-70 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Edit2 className="text-amber-500" /> Edit Student Data
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={24}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800 font-medium">
            <strong>Note:</strong> The Student ID ({formData.student_ID}) cannot be changed. To update the face data, capture a new snapshot below. Otherwise, leave the camera off to keep the existing photo.
          </div>

          <form id="editForm" onSubmit={handleSubmit} className="space-y-6">
            <StudentFormFields formData={formData} handleChange={handleChange} />
            
            <FaceRegistrationCamera 
               isOpen={isOpen} 
               onCapture={(blob) => setCapturedImageBlob(blob)} 
               onClear={() => setCapturedImageBlob(null)} 
            />
          </form>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-200 rounded-lg">Cancel</button>
          <button form="editForm" type="submit" disabled={isSubmitting} className="px-6 py-2 font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-md transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95">
             <Save size={18}/> {isSubmitting ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
        
      </div>
    </div>
  );
}