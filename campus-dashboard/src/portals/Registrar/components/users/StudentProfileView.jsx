import { ArrowLeft, Edit2, Cake, MapPin, Phone, UserCircle, Clock } from 'lucide-react';

export default function StudentProfileView({ student, onBack, onEdit }) {
  if (!student) return null;

  const imageUrl = student.face_Reference_Path 
    ? `http://localhost:5106/ReferenceFaces/${student.face_Reference_Path}?t=${student._cacheBuster}`
    : null;

  // THE FIX: Combines the names cleanly, automatically removing double spaces if there is no middle name!
  const fullName = [student.first_Name, student.middle_Name, student.last_Name].filter(Boolean).join(' ');

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-10">
      {/* Header Profile Actions */}
      <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Student Profile</h2>
            <p className="text-sm font-bold text-slate-500">{student.student_ID}</p>
          </div>
        </div>
        <button onClick={() => onEdit(student)} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-200 hover:border-amber-500 rounded-xl font-bold text-sm transition-all shadow-sm">
          <Edit2 size={16} /> Edit Record
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: ID Card Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-r from-blue-600 to-indigo-600"></div>
          
          <div className="relative mt-8 w-32 h-32 rounded-full border-4 border-white shadow-lg bg-slate-100 overflow-hidden flex items-center justify-center mb-4">
            {imageUrl ? (
              <img src={imageUrl} alt="Student Face" className="w-full h-full object-cover aspect-square" />
            ) : (
              <UserCircle size={64} className="text-slate-300" />
            )}
          </div>
          
          {/* THE FIX: Full name on one line, and the ID clearly displayed in a monospace font below it */}
          <h3 className="text-2xl font-black text-slate-800 leading-tight mb-1">{fullName}</h3>
          <p className="text-slate-500 font-bold font-mono tracking-widest mb-4">{student.student_ID}</p>
          
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
            student.enrollment_Status === 'Regular' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
            student.enrollment_Status === 'Dropped' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
            'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {student.enrollment_Status || 'Regular'}
          </span>

          <div className="w-full mt-8 space-y-4 text-left border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3 text-slate-600">
              <Phone size={18} className="text-blue-500 shrink-0" />
              <span className="font-medium text-sm">{student.contact_Number || 'No contact provided'}</span>
            </div>
            
            {/* THE FIX: Swapped the Calendar icon for the Cake icon */}
            <div className="flex items-center gap-3 text-slate-600">
              <Cake size={18} className="text-blue-500 shrink-0" />
              <span className="font-medium text-sm">{student.birthday || 'No birthday provided'}</span>
            </div>
            
            <div className="flex items-start gap-3 text-slate-600">
              <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <span className="font-medium text-sm leading-tight">{student.address || 'No address provided'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance & Records (Future Ready) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
              <Clock className="text-indigo-500" />
              <h3 className="text-lg font-black text-slate-800">Recent Attendance Logs</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <UserCircle size={48} className="mb-3 opacity-20" />
              <p className="font-medium">Attendance tracking features will be connected here in Phase 2.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}