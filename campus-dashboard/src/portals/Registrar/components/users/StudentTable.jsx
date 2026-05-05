import { Camera, UserCircle, Edit2, Trash2, ArrowUpDown, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';

export default function StudentTable({ students, sortConfig, onSort, onZoom, onViewProfile, onEdit, onDelete, viewMode }) {
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-blue-500" />;
  };

  return (
    <table className="w-full text-left table-fixed border-collapse">
      <thead>
        <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b-2 border-slate-200 cursor-pointer select-none">
          <th className="p-4 w-32 hover:bg-slate-100 transition-colors outline-none" onClick={() => onSort('student_ID')}>
            <div className="flex items-center gap-1">Student ID {renderSortIcon('student_ID')}</div>
          </th>
          
          {/* THE FIX: Reordered Columns (Last -> First -> Middle) */}
          <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => onSort('last_Name')}>
            <div className="flex items-center gap-1">Last Name {renderSortIcon('last_Name')}</div>
          </th>
          <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => onSort('first_Name')}>
            <div className="flex items-center gap-1">First Name {renderSortIcon('first_Name')}</div>
          </th>
          <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => onSort('middle_Name')}>
            <div className="flex items-center gap-1">Middle Name {renderSortIcon('middle_Name')}</div>
          </th>

          <th className="p-4 w-32 text-center hover:bg-slate-100 transition-colors outline-none" onClick={() => onSort('enrollment_Status')}>
            <div className="flex items-center justify-center gap-1">Status {renderSortIcon('enrollment_Status')}</div>
          </th>
          <th className="p-4 w-28 text-center cursor-default outline-none">Face</th>
          <th className="p-4 w-40 text-center cursor-default outline-none">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y-2 divide-slate-100">
        {students.map((student) => (
          <tr key={student.student_ID} className={`hover:bg-blue-50/40 transition-colors group ${student.enrollment_Status === 'Dropped' ? 'opacity-70' : ''}`}>
            
            <td className="p-4 font-bold text-slate-600 font-mono text-sm">{student.student_ID}</td>
            
            {/* THE FIX: Reordered Table Data matching the Headers */}
            <td className="p-4 font-black text-slate-800 truncate">{student.last_Name}</td>
            <td className="p-4 font-bold text-slate-700 truncate">{student.first_Name}</td>
            <td className="p-4 font-medium text-slate-500 truncate">{student.middle_Name || '-'}</td>

            <td className="p-4 text-center">
              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${
                  student.enrollment_Status === 'Regular' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                  student.enrollment_Status === 'Dropped' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                  'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {student.enrollment_Status || 'Regular'}
              </span>
            </td>
            <td className="p-4 flex justify-center items-center">
              {student.face_Reference_Path && !student.face_Reference_Path.includes("C:") ? (
                <img 
                   src={`http://localhost:5106/ReferenceFaces/${student.face_Reference_Path}?t=${student._cacheBuster}`} 
                   alt="Face" 
                   onClick={() => onZoom(`http://localhost:5106/ReferenceFaces/${student.face_Reference_Path}?t=${student._cacheBuster}`)}
                   className="w-12 h-12 object-cover aspect-square rounded-lg border-2 border-slate-200 shadow-sm cursor-zoom-in hover:opacity-80 transition-opacity"
                />
              ) : (
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border-2 border-slate-200"><Camera size={16}/></div>
              )}
            </td>
            <td className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => onViewProfile(student)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200" title="View Full Profile">
                  <UserCircle size={18} />
                </button>
                
                <button onClick={() => onEdit(student)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200" title="Edit Data/Face">
                  <Edit2 size={18} />
                </button>

                {/* Dynamic Actions based on View Mode */}
                {viewMode === 'archived' ? (
                  <>
                    <button onClick={() => onDelete(student, 'restore')} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200" title="Restore Student">
                      <RotateCcw size={18} />
                    </button>
                    {/* NEW: Hard Delete Button */}
                    <button onClick={() => onDelete(student, 'hard_delete')} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors border border-transparent hover:border-rose-300" title="Permanently Delete">
                      <Trash2 size={18} />
                    </button>
                  </>
                ) : (
                  <button onClick={() => onDelete(student, 'drop')} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200" title="Drop Student">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
        {students.length === 0 && (
          <tr><td colSpan="7" className="p-8 text-center text-slate-500 font-bold bg-slate-50/50">No matching students found in this view.</td></tr>
        )}
      </tbody>
    </table>
  );
}