import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, Upload, CheckCircle } from 'lucide-react';

export default function StudentEnrollmentModal({ isOpen, onClose, onSuccess }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImageBlob, setCapturedImageBlob] = useState(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    student_ID: '', first_Name: '', middle_Name: '', last_Name: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch {
      // Removed unused 'err' variable to fix ESLint warning
      alert("Error accessing camera. Please ensure permissions are granted.");
    }
  };

  // THE FIX: Decouple hardware shutdown from React state updates
  // This prevents the "setState synchronously within an effect" cascading render warning.
  const stopHardwareCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Used for manual button clicks (safe to update state here)
  const stopCamera = useCallback(() => {
    stopHardwareCamera();
    setIsCameraActive(false);
  }, []);

  // Cleanup camera hardware if modal closes unexpectedly or unmounts
  useEffect(() => {
    if (!isOpen) {
      stopHardwareCamera();
    }
    return () => stopHardwareCamera();
  }, [isOpen]);

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      // Draw video frame to canvas
      context.drawImage(videoRef.current, 0, 0, 320, 240);
      
      // Convert canvas to Blob (JPG format) for sending to C#
      canvasRef.current.toBlob((blob) => {
        setCapturedImageBlob(blob);
        setCapturedImageUrl(URL.createObjectURL(blob));
        stopCamera(); // Turn off camera and update state after capture
      }, 'image/jpeg', 0.9);
    }
  };

  const retakePhoto = () => {
    setCapturedImageBlob(null);
    setCapturedImageUrl(null);
    startCamera();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!capturedImageBlob) return alert("Please capture a face reference photo.");

    setIsSubmitting(true);

    // Prepare Multipart Form Data
    const submitData = new FormData();
    submitData.append('Student_ID', formData.student_ID);
    submitData.append('First_Name', formData.first_Name);
    submitData.append('Middle_Name', formData.middle_Name);
    submitData.append('Last_Name', formData.last_Name);
    submitData.append('Photo', capturedImageBlob, 'face.jpg');

    try {
      const response = await fetch('http://localhost:5106/api/student', {
        method: 'POST',
        body: submitData // Fetch automatically sets the correct Multipart headers
      });

      if (response.ok) {
        setFormData({ student_ID: '', first_Name: '', middle_Name: '', last_Name: '' });
        setCapturedImageBlob(null);
        setCapturedImageUrl(null);
        onSuccess(); // Trigger parent refresh
        onClose();   // Close Modal
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
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Camera className="text-blue-600" /> Enroll New Student
          </h3>
          <button onClick={() => { stopCamera(); onClose(); }} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={24}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="enrollForm" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student ID *</label>
                <input required type="text" name="student_ID" value={formData.student_ID} onChange={handleChange} placeholder="e.g. 24-1507" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
               <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name *</label>
                <input required type="text" name="first_Name" value={formData.first_Name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
               <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Middle Name</label>
                <input type="text" name="middle_Name" value={formData.middle_Name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
               <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name *</label>
                <input required type="text" name="last_Name" value={formData.last_Name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* CAMERA SECTION */}
            <div className="mt-6 border-t border-slate-100 pt-6">
               <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Face Data Registration</h4>
               
               {/* THE FIX: Replaced min-h-[280px] with canonical min-h-70 */}
               <div className="flex flex-col items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 p-4 min-h-70">
                 
                 {/* Hidden Canvas for processing the frame */}
                 <canvas ref={canvasRef} width="320" height="240" className="hidden"></canvas>

                 {!isCameraActive && !capturedImageUrl && (
                    <button type="button" onClick={startCamera} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95">
                      <Camera size={20}/> Start Web Camera
                    </button>
                 )}

                 {isCameraActive && (
                    <div className="flex flex-col items-center gap-4">
                      {/* THE FIX: Replaced w-[320px] h-[240px] with canonical w-80 h-60 */}
                      <video ref={videoRef} autoPlay playsInline className="rounded-lg shadow-inner bg-black w-80 h-60 object-cover scale-x-[-1]"></video>
                      <button type="button" onClick={captureSnapshot} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all active:scale-95 animate-pulse">
                        Capture Snapshot
                      </button>
                    </div>
                 )}

                 {capturedImageUrl && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        {/* THE FIX: Replaced w-[320px] h-[240px] with canonical w-80 h-60 */}
                        <img src={capturedImageUrl} alt="Captured face" className="rounded-lg shadow-md w-80 h-60 object-cover" />
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full"><CheckCircle size={20}/></div>
                      </div>
                      <button type="button" onClick={retakePhoto} className="text-slate-500 hover:text-slate-800 font-bold underline text-sm">
                        Retake Photo
                      </button>
                    </div>
                 )}

               </div>
            </div>

          </form>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={() => { stopCamera(); onClose(); }} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-200 rounded-lg">Cancel</button>
          <button form="enrollForm" type="submit" disabled={isSubmitting || !capturedImageBlob} className="px-6 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all disabled:opacity-50 flex items-center gap-2">
             <Upload size={18}/> {isSubmitting ? 'Saving...' : 'Enroll & Save Data'}
          </button>
        </div>

      </div>
    </div>
  );
}