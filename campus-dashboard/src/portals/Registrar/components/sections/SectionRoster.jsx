import { useState, useEffect, useCallback } from 'react'; // FIX: Imported useCallback
import { ArrowLeft, Search, UserMinus, UserPlus, BookOpen, UserCircle, Camera } from 'lucide-react';
import AddStudentsModal from './AddStudentsModal';
import ConfirmModal from '../../../../components/ui/ConfirmModal';

export default function SectionRoster({ section, onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, student: null });
  const [cacheBuster] = useState(() => Date.now());

  const [enrolledStudents, setEnrolledStudents] = useState([]); 

  // FIX: Wrapped fetchRoster in useCallback
  const fetchRoster = useCallback(() => {
    fetch(`http://localhost:5106/api/sections/${section.section_ID}/students`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setEnrolledStudents(data); })
      .catch(err => console.error(err));
  }, [section.section_ID]); // Dependency array included here

  // FIX: Added fetchRoster to the useEffect dependency array
  useEffect(() => { 
    fetchRoster(); 
  }, [fetchRoster]);

  const handleAddStudents = async (newStudents) => {
    const studentIds = newStudents.map(s => s.student_ID);
    try {
      const res = await fetch(`http://localhost:5106/api/sections/${section.section_ID}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentIds)
      });
      if (res.ok) fetchRoster(); // Reload to get fresh data
    } catch (err) { console.error(err); }
  };

  const handleRemoveClick = (student) => {
    setConfirmModal({ isOpen: true, student });
  };

  // ACTUALLY DELETE FROM DATABASE
  const executeRemove = async () => {
    try {
      const res = await fetch(`http://localhost:5106/api/sections/${section.section_ID}/students/${confirmModal.student.student_ID}`, { method: 'DELETE' });
      if (res.ok) {
         setEnrolledStudents(prev => prev.filter(s => s.student_ID !== confirmModal.student.student_ID));
      }
    } catch (err) { console.error(err); }
    setConfirmModal({ isOpen: false, student: null });
  };

  const filteredStudents = enrolledStudents.filter(student => {
    const fullName = `${student.last_Name} ${student.first_Name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || student.student_ID.includes(searchQuery);
  });

  if (!section) return null;

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-10">
      
      <AddStudentsModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddStudents} currentEnrollees={enrolledStudents} />
      <ConfirmModal isOpen={confirmModal.isOpen} type="danger" title="Remove from Section" message={`Remove ${confirmModal.student?.first_Name} ${confirmModal.student?.last_Name} from ${section.section_Name}?`} onConfirm={executeRemove} onCancel={() => setConfirmModal({ isOpen: false, student: null })} />

      <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{section.section_Name}</h2>
            <p className="text-sm font-bold text-slate-500">Manage section roster and details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><BookOpen size={24} /></div>
          <div>
            <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-0.5">Assigned Subject</p>
            <p className="text-lg font-black text-indigo-900 leading-tight">{section.primary_Subject || "No Subject Assigned"}</p>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><UserCircle size={24} /></div>
          <div>
            <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-0.5">Primary Adviser</p>
            <p className="text-lg font-black text-amber-900 leading-tight">{section.primary_Adviser || "No Adviser Assigned"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search roster by Name or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" />
          </div>
          
          <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap">
            <UserPlus size={18} /> Add Students
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-white text-xs uppercase text-slate-400 font-black border-b-2 border-slate-100">
                <th className="p-4 w-24 text-center">Face</th>
                <th className="p-4 w-32">Student ID</th>
                <th className="p-4">Last Name</th>
                <th className="p-4">First Name</th>
                <th className="p-4">Middle Name</th>
                <th className="p-4 w-28 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student) => {
                return (
                  <tr key={student.student_ID} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-3 flex justify-center items-center">
                       {student.face_Reference_Path && !student.face_Reference_Path.includes("C:") ? (
                        <img src={`http://localhost:5106/ReferenceFaces/${student.face_Reference_Path}?t=${cacheBuster}`} alt="Face" className="w-10 h-10 object-cover aspect-square rounded-full border border-slate-200 shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200"><Camera size={14}/></div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-blue-600 font-mono text-sm">{student.student_ID}</td>
                    <td className="p-4 font-black text-slate-800">{student.last_Name}</td>
                    <td className="p-4 font-bold text-slate-700">{student.first_Name}</td>
                    <td className="p-4 font-medium text-slate-500">{student.middle_Name || '-'}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleRemoveClick(student)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200" title="Remove from Section">
                        <UserMinus size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                     <div className="flex flex-col items-center justify-center text-slate-400">
                        <UserMinus size={48} className="mb-3 opacity-20" />
                        <p className="font-bold text-lg text-slate-500">Roster is empty</p>
                        <p className="text-sm">Click 'Add Students' to build this section.</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}