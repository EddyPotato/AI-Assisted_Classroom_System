import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, Camera, X, Edit2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import StudentEnrollmentModal from '../enrollment/StudentEnrollmentModal';
import EditStudentModal from '../enrollment/EditStudentModal';

export default function UserDirectoryTab() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'student_ID', direction: 'asc' });
  
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  const fetchStudents = useCallback(() => {
    let isMounted = true;
    fetch('http://localhost:5106/api/student')
      .then(res => res.json())
      .then(data => { if (isMounted && Array.isArray(data)) setStudents(data); })
      .catch(err => console.error("Failed to fetch students", err));
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const cleanup = fetchStudents();
    return cleanup;
  }, [fetchStudents]);

  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_Name} ${student.middle_Name} ${student.last_Name}`.toLowerCase();
    const matchesSearch = student.student_ID.includes(searchQuery) || fullName.includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || student.enrollment_Status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-primary-500" /> : <ChevronDown size={14} className="text-primary-500" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <StudentEnrollmentModal isOpen={showEnrollModal} onClose={() => setShowEnrollModal(false)} onSuccess={fetchStudents} />
      <EditStudentModal isOpen={!!editingStudent} student={editingStudent} onClose={() => setEditingStudent(null)} onSuccess={fetchStudents} />

      {zoomedImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in" onClick={() => setZoomedImage(null)}>
          <div className="relative">
             <button onClick={() => setZoomedImage(null)} className="absolute -top-4 -right-4 bg-white text-slate-800 p-2 rounded-full shadow-lg hover:bg-rose-500 hover:text-white transition-colors"><X size={20} /></button>
             <img src={zoomedImage} alt="Face Reference" className="rounded-2xl shadow-2xl max-w-xl max-h-[80vh] border-4 border-white object-cover" />
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Student Directory</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage student enrollments and face data references.</p>
        </div>
        <button onClick={() => setShowEnrollModal(true)} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95">
          <UserPlus size={18} /> Enroll New Student
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search ID or Name..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg outline-none text-slate-700 font-bold bg-white">
            <option value="All">All Statuses</option>
            <option value="Regular">Regular Students</option>
            <option value="Irregular">Irregular Students</option>
          </select>
        </div>
        
        <table className="w-full text-left table-fixed border-collapse">
          <thead>
            {/* THE FIX: Added outline-none to all clickable th tags to remove the black line */}
            <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b-2 border-slate-200 cursor-pointer select-none">
              <th className="p-4 w-32 hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('student_ID')}>
                <div className="flex items-center gap-1">Student ID {renderSortIcon('student_ID')}</div>
              </th>
              <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('first_Name')}>
                <div className="flex items-center gap-1">First Name {renderSortIcon('first_Name')}</div>
              </th>
              <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('middle_Name')}>
                <div className="flex items-center gap-1">Middle Name {renderSortIcon('middle_Name')}</div>
              </th>
              <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('last_Name')}>
                <div className="flex items-center gap-1">Last Name {renderSortIcon('last_Name')}</div>
              </th>
              <th className="p-4 w-32 text-center hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('enrollment_Status')}>
                 <div className="flex items-center justify-center gap-1">Status {renderSortIcon('enrollment_Status')}</div>
              </th>
              <th className="p-4 w-28 text-center cursor-default outline-none">Face</th>
              <th className="p-4 w-24 text-center cursor-default outline-none">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {sortedStudents.map((student) => (
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
                       onClick={() => setZoomedImage(`http://localhost:5106/faces/${student.face_Reference_Path}`)}
                       className="w-12 h-12 object-cover rounded-lg border-2 border-slate-200 shadow-sm cursor-zoom-in hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border-2 border-slate-200">
                      <Camera size={16}/>
                    </div>
                  )}
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => setEditingStudent(student)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-transparent hover:border-primary-200" title="Edit Data/Face">
                    <Edit2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {sortedStudents.length === 0 && (
              <tr><td colSpan="7" className="p-8 text-center text-slate-500 font-bold bg-slate-50/50">No matching students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}