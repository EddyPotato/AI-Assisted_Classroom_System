import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Archive, Users } from 'lucide-react';
import StudentEnrollmentView from '../enrollment/StudentEnrollmentView';
import EditStudentView from '../enrollment/EditStudentView';
import StudentProfileView from './StudentProfileView';
import ConfirmModal from '../../../../components/ui/ConfirmModal';

import StudentToolbar from './StudentToolbar';
import StudentTable from './StudentTable';
import FaceZoomModal from './FaceZoomModal';

export default function UserDirectoryTab() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'student_ID', direction: 'asc' });
  
  const [currentView, setCurrentView] = useState('directory'); 
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'archived'
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
  const [toastMessage, setToastMessage] = useState('');

  const fetchStudents = useCallback(() => {
    let isMounted = true;
    const currentFetchTime = Date.now(); 

    fetch('http://localhost:5106/api/student')
      .then(res => res.json())
      .then(data => { 
        if (isMounted && Array.isArray(data)) {
          const dataWithCacheBuster = data.map(student => ({
            ...student,
            _cacheBuster: currentFetchTime 
          }));
          setStudents(dataWithCacheBuster); 
        }
      })
      .catch(err => console.error("Failed to fetch students", err));
    return () => { isMounted = false; };
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleOpenEnroll = () => setCurrentView('enroll');
  
  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setCurrentView('edit');
  };

  const handleOpenProfile = (student) => {
    setSelectedStudent(student);
    setCurrentView('profile');
  };

  const handleBackToDirectory = () => {
    setSelectedStudent(null);
    setCurrentView('directory');
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500); 
  };

  const filteredStudents = students.filter(student => {
    const isDropped = student.enrollment_Status === 'Dropped';
    const matchesViewMode = viewMode === 'active' ? !isDropped : isDropped;
    
    const fullName = `${student.first_Name} ${student.middle_Name} ${student.last_Name}`.toLowerCase();
    const matchesSearch = student.student_ID.includes(searchQuery) || fullName.includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || student.enrollment_Status === filterStatus;
    
    return matchesViewMode && matchesSearch && matchesFilter;
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

  const handleArchiveClick = (student) => {
    const fullName = [student.first_Name, student.middle_Name, student.last_Name].filter(Boolean).join(' ');

    if (viewMode === 'active') {
      setModal({
        isOpen: true, 
        type: 'danger', 
        title: 'Drop Student Record',
        message: `Are you sure you want to mark ${fullName} as Dropped? They will be moved to the archive.`,
        onConfirm: () => executeStatusChange(student, 'Dropped', "Student moved to archive.")
      });
    } else {
      setModal({
        isOpen: true, 
        type: 'info', 
        title: 'Restore Student Record',
        message: `Restore ${fullName} to Regular status?`,
        onConfirm: () => executeStatusChange(student, 'Regular', "Student restored successfully.")
      });
    }
  };

  const executeStatusChange = async (student, newStatus, successMsg) => {
    setModal({ ...modal, isOpen: false });
    
    const submitData = new FormData();
    submitData.append('First_Name', student.first_Name);
    submitData.append('Last_Name', student.last_Name);
    submitData.append('Enrollment_Status', newStatus); 
    submitData.append('Middle_Name', student.middle_Name || '');
    submitData.append('Contact_Number', student.contact_Number || '');
    submitData.append('Birthday', student.birthday || '');
    submitData.append('Address', student.address || '');

    try {
      const res = await fetch(`http://localhost:5106/api/student/${student.student_ID}`, { 
          method: 'PUT', body: submitData 
      });
      if (res.ok) {
        fetchStudents();
        triggerToast(successMsg);
      } else alert("Failed to update student status.");
    } catch { alert("Network error."); }
  };

  if (currentView === 'enroll') return <StudentEnrollmentView onBack={handleBackToDirectory} onSuccess={fetchStudents} />;
  if (currentView === 'edit' && selectedStudent) return <EditStudentView student={selectedStudent} onBack={handleBackToDirectory} onSuccess={fetchStudents} onShowToast={triggerToast} />;
  if (currentView === 'profile' && selectedStudent) return <StudentProfileView student={selectedStudent} onBack={handleBackToDirectory} onEdit={handleOpenEdit} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-100 bg-slate-800 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300">
          <CheckCircle2 className="text-emerald-400" size={20} />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      <ConfirmModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal({ ...modal, isOpen: false })} />
      <FaceZoomModal zoomedImage={zoomedImage} onClose={() => setZoomedImage(null)} />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Student Directory</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage student enrollments and face data references.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
                <button onClick={() => setViewMode('active')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Users size={16} /> Active
                </button>
                <button onClick={() => setViewMode('archived')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'archived' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Archive size={16} /> Dropped
                </button>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* THE FIX: Passed onEnroll and viewMode down to the toolbar! */}
        <StudentToolbar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            filterStatus={filterStatus} 
            setFilterStatus={setFilterStatus}
            onEnroll={handleOpenEnroll}
            viewMode={viewMode}
        />
        <StudentTable 
            students={sortedStudents} sortConfig={sortConfig} onSort={handleSort} 
            onZoom={setZoomedImage} onViewProfile={handleOpenProfile} 
            onEdit={handleOpenEdit} onDelete={handleArchiveClick} 
            viewMode={viewMode}
        />
      </div>
    </div>
  );
}