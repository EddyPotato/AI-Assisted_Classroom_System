import { useState, useEffect, useMemo } from 'react';
import { Search, X, CheckSquare, Square, Camera, CheckCircle2 } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function AddStudentsModal({ isOpen, onClose, onAdd, currentEnrollees = [] }) {
  const [allStudents, setAllStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // THE FIX 1: Stable cache buster that only generates once on mount
  const [cacheBuster] = useState(() => Date.now());

  // THE FIX 2: Derived State Pattern to reset the modal cleanly when it closes
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setSearchQuery('');
      setSelectedIds([]);
    }
  }

  // Fetch all students to pick from
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      fetch('http://localhost:5106/api/student')
        .then(res => {
          if (!res.ok) throw new Error(`Server returned ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (isMounted && Array.isArray(data)) setAllStudents(data);
        })
        .catch(err => console.error("Failed to fetch students for modal", err));
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  // Filter out students already in the section, apply search, and sort by Last Name
  const availableStudents = useMemo(() => {
    const currentIds = currentEnrollees.map(s => s.student_ID);
    
    return allStudents
      .filter(student => !currentIds.includes(student.student_ID) && student.enrollment_Status !== 'Dropped')
      .filter(student => {
        const fullName = `${student.last_Name} ${student.first_Name} ${student.middle_Name || ''}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) || student.student_ID.includes(searchQuery);
      })
      .sort((a, b) => a.last_Name.localeCompare(b.last_Name));
  }, [allStudents, currentEnrollees, searchQuery]);

  const handleToggle = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const selectedStudentsData = allStudents.filter(s => selectedIds.includes(s.student_ID));
    onAdd(selectedStudentsData);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    // THE FIX 3: Replaced z-[9999] with the canonical Tailwind v4 z-9999 class
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Add Students to Section</h3>
            <p className="text-xs font-bold text-slate-500 mt-0.5">{selectedIds.length} student(s) selected</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by Last Name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* The GC-Style Clickable List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-50/50">
          {availableStudents.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-bold">No students found.</div>
          ) : (
            availableStudents.map(student => {
              const isSelected = selectedIds.includes(student.student_ID);
              return (
                <div 
                  key={student.student_ID}
                  onClick={() => handleToggle(student.student_ID)}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500 shadow-sm' 
                      : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {/* Face Thumbnail */}
                  <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center">
                    {student.face_Reference_Path && !student.face_Reference_Path.includes("C:") ? (
                      <img src={`http://localhost:5106/ReferenceFaces/${student.face_Reference_Path}?t=${cacheBuster}`} alt="face" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={16} className="text-slate-400" />
                    )}
                  </div>

                  {/* Name details (Last Name first) */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {student.last_Name}, {student.first_Name} {student.middle_Name || ''}
                    </p>
                    <p className={`text-xs font-bold font-mono mt-0.5 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>
                      {student.student_ID}
                    </p>
                  </div>

                  {/* Checkbox Indicator */}
                  <div className="shrink-0 pr-2">
                    {isSelected ? <CheckSquare size={22} className="text-blue-600" /> : <Square size={22} className="text-slate-300" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
          <span className="text-sm font-bold text-slate-500">
             {selectedIds.length > 0 ? <span className="text-blue-600 flex items-center gap-1"><CheckCircle2 size={16}/> Ready to add</span> : 'Select students to continue'}
          </span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
            <button 
              onClick={handleConfirm} 
              disabled={selectedIds.length === 0}
              className="px-6 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              Add Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}