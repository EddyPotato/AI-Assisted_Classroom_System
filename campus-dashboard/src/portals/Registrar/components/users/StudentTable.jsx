import { Camera, BookOpen, Edit2, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

export default function StudentTable({ 
  students, sortConfig, onSort, onZoom, onAssign, onEdit, onDelete 
}) {
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-primary-500" /> : <ChevronDown size={14} className="text-primary-500" />;
  };

  return (
    <table className="w-full text-left table-fixed border-collapse">
      <thead>
        <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b-2 border-slate-200 cursor-pointer select-none">
          <th className="p-4 w-32 hover:bg-slate-100 transition-colors outline-none" onClick={() => onSort('student_ID')}>
            <div className="flex items-center gap-1">Student ID {renderSortIcon('student_ID')}</div>
          </th>
          <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => onSort('first_Name')}>
            <div className="flex items-center gap-1">First Name {renderSortIcon('first_Name')}</div>
          </th>
          <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => onSort('middle_Name')}>
            <div className="flex items-center gap-1">Middle Name {renderSortIcon('middle_Name')}</div>
          </th>
          <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => onSort('last_Name')}>
            <div className="flex items-center gap-1">Last Name {renderSortIcon('last_Name')}</div>
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
          <tr key={student.student_ID} className="hover:bg-primary-50/40 transition-colors group">
            <td className="p-4 font-bold text-slate-600 font-mono text-sm">{student.student_ID}</td>
            <td className="p-4 font-bold text-slate-800 truncate">{student.first_Name}</td>
            <td className="p-4 font-medium text-slate-600 truncate">{student.middle_Name || '-'}</td>
            <td className="p-4 font-bold text-slate-800 truncate">{student.last_Name}</td>
            <td className="p-4 text-center">
              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${student.enrollment_Status === 'Regular' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {student.enrollment_Status || 'Regular'}
              </span>
            </td>
            <td className="p-4 flex justify-center items-center">
              {student.face_Reference_Path && !student.face_Reference_Path.includes("C:") ? (
                <img 
                   src={`http://localhost:5106/faces/${student.face_Reference_Path}`} 
                   alt="Face" 
                   onClick={() => onZoom(`http://localhost:5106/faces/${student.face_Reference_Path}`)}
                   className="w-12 h-12 object-cover rounded-lg border-2 border-slate-200 shadow-sm cursor-zoom-in hover:opacity-80 transition-opacity"
                />
              ) : (
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border-2 border-slate-200">
                  <Camera size={16}/>
                </div>
              )}
            </td>
            <td className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <button 
                  onClick={() => onAssign(student)} 
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200" 
                  title="Assign Classes"
                >
                  <BookOpen size={18} />
                </button>
                <button 
                  onClick={() => onEdit(student)} 
                  className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200" 
                  title="Edit Data/Face"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => onDelete(student)} 
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200" 
                  title="Delete Student"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {students.length === 0 && (
          <tr><td colSpan="7" className="p-8 text-center text-slate-500 font-bold bg-slate-50/50">No matching students found.</td></tr>
        )}
      </tbody>
    </table>
  );
}