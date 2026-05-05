import { useState } from 'react';
import { CheckCircle2, Archive, Users, Loader2 } from 'lucide-react';
import StudentEnrollmentView from '../enrollment/StudentEnrollmentView';
import EditStudentView from '../enrollment/EditStudentView';
import StudentProfileView from './StudentProfileView';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import StudentToolbar from './StudentToolbar';
import StudentTable from './StudentTable';
import FaceZoomModal from './FaceZoomModal';
import { useStudentDirectoryLogic } from './hooks/useStudentDirectoryLogic';

export default function UserDirectoryTab() {
  const [currentView, setCurrentView] = useState('directory'); 
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  // Bring in all the logic from the custom hook!
  const {
    isLoading, sortedStudents, 
    searchQuery, setSearchQuery, 
    filterStatus, setFilterStatus,
    sortConfig, handleSort, 
    viewMode, setViewMode, 
    modal, setModal, 
    toastMessage, triggerToast,
    handleArchiveClick, fetchStudents
  } = useStudentDirectoryLogic();

  // Navigation Logic
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

  // Sub-view rendering
  if (currentView === 'enroll') return <StudentEnrollmentView onBack={handleBackToDirectory} onSuccess={() => fetchStudents(true)} />;
  if (currentView === 'edit' && selectedStudent) return <EditStudentView student={selectedStudent} onBack={handleBackToDirectory} onSuccess={() => fetchStudents(true)} onShowToast={triggerToast} />;
  if (currentView === 'profile' && selectedStudent) return <StudentProfileView student={selectedStudent} onBack={handleBackToDirectory} onEdit={handleOpenEdit} />;

  // Main Directory rendering
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <StudentToolbar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            filterStatus={filterStatus} 
            setFilterStatus={setFilterStatus}
            onEnroll={handleOpenEnroll}
            viewMode={viewMode}
        />
        
        {isLoading ? (
          <div className="p-16 text-center flex flex-col items-center justify-center text-blue-600 font-bold animate-pulse">
             <Loader2 size={32} className="mb-4 opacity-50 animate-spin" />
             Loading student directory...
          </div>
        ) : (
          <StudentTable 
              students={sortedStudents} sortConfig={sortConfig} onSort={handleSort} 
              onZoom={setZoomedImage} onViewProfile={handleOpenProfile} 
              onEdit={handleOpenEdit} onDelete={handleArchiveClick} 
              viewMode={viewMode}
          />
        )}
      </div>
    </div>
  );
}