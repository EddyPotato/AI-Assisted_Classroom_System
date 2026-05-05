import { UserMinus, Camera, ArrowUpDown, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { useState } from 'react';

export default function StudentListTab({ 
  enrolledStudents, 
  searchQuery, 
  onSetZoomedImage, 
  cacheBuster,
  onOpenConfirmModal 
}) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'last_Name', direction: 'asc' });

  // 1. Filter Logic
  const filteredStudents = enrolledStudents.filter(student => {
    const fullName = `${student.last_Name} ${student.first_Name} ${student.middle_Name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || student.student_ID.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || student.enrollment_Status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 2. Sort Logic
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-blue-500" />;
  };

  return (
    <div className="flex flex-col w-full">
      
      {/* Sub-Toolbar: Status Filter */}
      <div className="px-5 py-3 border-b border-slate-100 bg-white flex justify-between items-center">
         <span className="text-sm font-bold text-slate-500 flex items-center gap-2">
            <Filter size={16} className="text-blue-500" /> Filter by Status
         </span>
         <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['All', 'Regular', 'Irregular'].map(status => (
               <button
                 key={status}
                 onClick={() => setStatusFilter(status)}
                 className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${statusFilter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 {status === 'All' ? 'All Statuses' : status}
               </button>
            ))}
         </div>
      </div>

      <div className="overflow-x-auto w-full">
        {/* THE FIX: Fixed table widths, even spacing, and sortable headers */}
        <table className="w-full text-left border-collapse min-w-250">
          <thead>
            <tr className="bg-white text-xs uppercase text-slate-500 font-black border-b-2 border-slate-100 cursor-pointer select-none">
              <th className="p-4 w-24 text-center cursor-default outline-none">Face</th>
              
              <th className="p-4 w-32 hover:bg-slate-50 transition-colors outline-none" onClick={() => handleSort('student_ID')}>
                <div className="flex items-center gap-1">Student ID {renderSortIcon('student_ID')}</div>
              </th>
              
              <th className="p-4 w-auto hover:bg-slate-50 transition-colors outline-none" onClick={() => handleSort('last_Name')}>
                <div className="flex items-center gap-1">Last Name {renderSortIcon('last_Name')}</div>
              </th>
              
              <th className="p-4 w-auto hover:bg-slate-50 transition-colors outline-none" onClick={() => handleSort('first_Name')}>
                <div className="flex items-center gap-1">First Name {renderSortIcon('first_Name')}</div>
              </th>

              {/* NEW: Middle Name Column */}
              <th className="p-4 w-auto hover:bg-slate-50 transition-colors outline-none" onClick={() => handleSort('middle_Name')}>
                <div className="flex items-center gap-1">Middle Name {renderSortIcon('middle_Name')}</div>
              </th>

              {/* NEW: Status Column */}
              <th className="p-4 w-32 text-center hover:bg-slate-50 transition-colors outline-none" onClick={() => handleSort('enrollment_Status')}>
                <div className="flex items-center justify-center gap-1">Status {renderSortIcon('enrollment_Status')}</div>
              </th>

              <th className="p-4 w-28 text-center cursor-default outline-none">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedStudents.map((student) => (
              <tr key={student.student_ID} className="hover:bg-slate-50 transition-colors group">
                
                <td className="p-3 flex justify-center items-center">
                  {student.face_Reference_Path && !student.face_Reference_Path.includes("C:") ? (
                    <img 
                      src={`http://localhost:5106/ReferenceFaces/${student.face_Reference_Path}?t=${cacheBuster}`} 
                      alt="Face" 
                      onClick={() => onSetZoomedImage(`http://localhost:5106/ReferenceFaces/${student.face_Reference_Path}?t=${cacheBuster}`)}
                      className="w-10 h-10 object-cover aspect-square rounded-full border border-slate-200 shadow-sm cursor-zoom-in hover:opacity-80 transition-opacity" 
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200"><Camera size={14}/></div>
                  )}
                </td>

                <td className="p-4 font-bold text-blue-600 font-mono text-sm">{student.student_ID}</td>
                <td className="p-4 font-black text-slate-800">{student.last_Name}</td>
                <td className="p-4 font-bold text-slate-700">{student.first_Name}</td>
                <td className="p-4 font-medium text-slate-500">{student.middle_Name || '-'}</td>
                
                <td className="p-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${
                      student.enrollment_Status === 'Regular' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      student.enrollment_Status === 'Dropped' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                      'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {student.enrollment_Status || 'Regular'}
                  </span>
                </td>

                <td className="p-4 text-center">
                  <button onClick={() => onOpenConfirmModal(student)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200" title="Remove Student">
                    <UserMinus size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {sortedStudents.length === 0 && (
              <tr><td colSpan="7" className="p-12 text-center text-slate-500 font-bold">Roster is empty.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}