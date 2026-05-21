import { useState, useEffect, useMemo } from 'react';
import { Search, ArrowLeft, CheckSquare, Square, Camera, UserPlus, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5106';

export default function AddStudentsView({ section, termId, onBack, onAdd, currentEnrollees = [] }) {
  const [allStudents, setAllStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cacheBuster] = useState(() => Date.now());

  // THE FIX: Logic moved entirely into useEffect using the microtask yield pattern
  useEffect(() => {
    let isMounted = true;

    const loadStudents = async () => {
      await Promise.resolve(); // Force execution into the async microtask queue
      if (!isMounted) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/student`);
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        const data = await response.json();
        
        if (isMounted) {
          setAllStudents(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch students for view:", err);
          setError(err.message || 'An unexpected error occurred while fetching the student registry.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStudents();

    return () => {
      isMounted = false;
    };
  }, []);

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
  };

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-10">
      
      <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm w-full">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <UserPlus className="text-blue-600" /> Add Students to Section
            </h2>
            <p className="text-sm font-bold text-slate-500">
              Select students to enroll in {section?.section_Name} for <span className="text-blue-600">{termId}</span>.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-3 font-bold text-sm shadow-sm">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 w-full flex flex-col h-[75vh]">
        
        <div className="relative mb-6 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by Last Name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm text-slate-800"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {isLoading ? (
             <div className="text-center py-20 text-blue-600 font-bold text-lg flex flex-col items-center animate-pulse">
                <Loader2 size={32} className="mb-4 opacity-50 animate-spin" />
                Loading available students...
             </div>
          ) : availableStudents.length === 0 ? (
            <div className="text-center py-20 text-slate-500 font-bold text-lg">No available students found.</div>
          ) : (
            availableStudents.map(student => {
              const isSelected = selectedIds.includes(student.student_ID);
              const isRegular = student.enrollment_Status === 'Regular';

              return (
                <div 
                  key={student.student_ID}
                  onClick={() => handleToggle(student.student_ID)}
                  className={`flex items-center gap-5 p-4 rounded-xl cursor-pointer transition-all border select-none group ${isSelected ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'}`}
                >
                  <div className="shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center">
                    {student.face_Reference_Path && !student.face_Reference_Path.includes("C:") ? (
                      <img src={`${API_BASE_URL}/ReferenceFaces/${student.face_Reference_Path}?t=${cacheBuster}`} alt="face" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={20} className="text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                    <div className="text-xl font-black text-slate-800 truncate group-hover:text-blue-900 transition-colors">
                      {student.last_Name}, {student.first_Name} {student.middle_Name || ''}
                      <span className={`font-mono text-lg ml-3 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                        ({student.student_ID})
                      </span>
                    </div>

                    <div className="shrink-0">
                      <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border shadow-sm ${isRegular ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                        {student.enrollment_Status || 'Regular'}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2 pr-1">
                    {isSelected ? <CheckSquare size={28} className="text-blue-600" /> : <Square size={28} className="text-slate-300" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-6 mt-4 border-t border-slate-100 flex justify-between items-center shrink-0">
          <span className="text-base font-bold text-slate-500">
            {selectedIds.length > 0 
              ? <span className="text-blue-600 flex items-center gap-2"><CheckCircle2 size={20}/> {selectedIds.length} students selected</span> 
              : 'Select students to enroll'
            }
          </span>
          <div className="flex gap-4">
            <button onClick={onBack} className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
              Cancel
            </button>
            <button 
              onClick={handleConfirm} 
              disabled={selectedIds.length === 0}
              className="px-8 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-lg"
            >
              Add Selected Students
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
