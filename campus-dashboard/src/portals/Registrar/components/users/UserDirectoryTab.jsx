import { useState, useEffect, useCallback } from 'react';
import { UserPlus } from 'lucide-react';
import StudentEnrollmentView from '../enrollment/StudentEnrollmentView'; // Updated import
import EditStudentView from '../enrollment/EditStudentView';             // Updated import
import AssignClassesModal from '../enrollment/AssignClassesModal';
import ConfirmModal from '../../../../components/ui/ConfirmModal';

import StudentToolbar from './StudentToolbar';
import StudentTable from './StudentTable';
import FaceZoomModal from './FaceZoomModal';

export default function UserDirectoryTab() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'student_ID', direction: 'asc' });
  
  // NEW: Drill-Down View State ('directory', 'enroll', 'edit')
  const [currentView, setCurrentView] = useState('directory');
  
  const [editingStudent, setEditingStudent] = useState(null);
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });

  const fetchStudents = useCallback(() => {
    let isMounted = true;
    fetch('http://localhost:5106/api/student')
      .then(res => res.json())
      .then(data => { if (isMounted && Array.isArray(data)) setStudents(data); })
      .catch(err => console.error("Failed to fetch students", err));
    return () => { isMounted = false; };
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // View Navigation Handlers
  const handleOpenEnroll = () => setCurrentView('enroll');
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setCurrentView('edit');
  };
  const handleBackToDirectory = () => {
    setEditingStudent(null);
    setCurrentView('directory');
  };

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

  const handleDeleteClick = (student) => {
    setModal({
      isOpen: true, type: 'danger', title: 'Archive Student Record',
      message: `Are you sure you want to mark ${student.first_Name} ${student.last_Name} (${student.student_ID}) as Dropped?`,
      onConfirm: () => executeDelete(student.student_ID)
    });
  };

  const executeDelete = async (id) => {
    setModal({ ...modal, isOpen: false });
    try {
      const res = await fetch(`http://localhost:5106/api/student/${id}`, { method: 'DELETE' });
      if (res.ok) fetchStudents(); 
      else alert("Failed to delete student.");
    } catch {
      alert("Network error.");
    }
  };

  // --- RENDER DRILL-DOWN VIEWS ---
  if (currentView === 'enroll') {
    return <StudentEnrollmentView onBack={handleBackToDirectory} onSuccess={fetchStudents} />;
  }

  if (currentView === 'edit' && editingStudent) {
    return <EditStudentView student={editingStudent} onBack={handleBackToDirectory} onSuccess={fetchStudents} />;
  }

  // --- RENDER MAIN DIRECTORY ---
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ConfirmModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal({ ...modal, isOpen: false })} />
      <AssignClassesModal isOpen={!!assigningStudent} student={assigningStudent} onClose={() => setAssigningStudent(null)} />
      <FaceZoomModal zoomedImage={zoomedImage} onClose={() => setZoomedImage(null)} />

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Student Directory</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage student enrollments and face data references.</p>
        </div>
        <button onClick={handleOpenEnroll} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95">
          <UserPlus size={18} /> Enroll New Student
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <StudentToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
        <StudentTable 
          students={sortedStudents} sortConfig={sortConfig} onSort={handleSort} 
          onZoom={setZoomedImage} onAssign={setAssigningStudent} 
          onEdit={handleOpenEdit} onDelete={handleDeleteClick} 
        />
      </div>
    </div>
  );
}