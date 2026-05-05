import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Users, Archive, Loader2 } from 'lucide-react';
import StaffEnrollmentView from './StaffEnrollmentView';
import EditStaffView from './EditStaffView';
import StaffProfileView from './StaffProfileView';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import StaffToolbar from './StaffToolbar';
import StaffTable from './StaffTable';
import FaceZoomModal from '../users/FaceZoomModal'; 

export default function StaffDirectoryTab() {
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'user_ID', direction: 'asc' });
  const [currentView, setCurrentView] = useState('directory'); 
  const [viewMode, setViewMode] = useState('active'); 
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
  const [toastMessage, setToastMessage] = useState('');

  // 1. ISOLATED MOUNT EFFECT (Fixes the ESLint Warning)
  useEffect(() => {
    let isMounted = true;
    const currentFetchTime = Date.now(); 

    fetch('http://localhost:5106/api/user')
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(data => { 
        if (isMounted && Array.isArray(data)) {
          const dataWithCacheBuster = data.map(staff => ({
            ...staff,
            _cacheBuster: currentFetchTime 
          }));
          setStaffList(dataWithCacheBuster); 
        }
      })
      .catch(err => {
        console.error("Failed to fetch staff:", err);
        if (isMounted) setStaffList([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // 2. IMPERATIVE REFRESH FUNCTION (For manual re-fetching)
  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    const currentFetchTime = Date.now(); 

    try {
      const res = await fetch('http://localhost:5106/api/user');
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const dataWithCacheBuster = data.map(staff => ({
          ...staff,
          _cacheBuster: currentFetchTime 
        }));
        setStaffList(dataWithCacheBuster); 
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
      setStaffList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOpenEnroll = () => setCurrentView('enroll');
  const handleOpenEdit = (staff) => { setSelectedStaff(staff); setCurrentView('edit'); };
  const handleOpenProfile = (staff) => { setSelectedStaff(staff); setCurrentView('profile'); };
  const handleBackToDirectory = () => { setSelectedStaff(null); setCurrentView('directory'); };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500); 
  };

  const filteredStaff = staffList.filter(staff => {
    const isInactive = staff.status === 'Inactive';
    const matchesViewMode = viewMode === 'active' ? !isInactive : isInactive;
    const fullName = `${staff.first_Name} ${staff.middle_Name || ''} ${staff.last_Name}`.toLowerCase();
    const matchesSearch = staff.user_ID.toLowerCase().includes(searchQuery.toLowerCase()) || fullName.includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'All' || staff.role === filterRole;
    
    return matchesViewMode && matchesSearch && matchesRole;
  });

  const sortedStaff = [...filteredStaff].sort((a, b) => {
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

  const handleActionClick = (staff, actionType) => {
    const fullName = [staff.first_Name, staff.middle_Name, staff.last_Name].filter(Boolean).join(' ');
    if (actionType === 'deactivate') {
      setModal({
        isOpen: true, type: 'danger', title: 'Deactivate Staff Account',
        message: `Mark ${fullName} as Inactive? They will lose system access and be moved to the archive.`,
        onConfirm: () => executeStatusChange(staff, 'Inactive', "Staff account deactivated.")
      });
    } else if (actionType === 'restore') {
      setModal({
        isOpen: true, type: 'info', title: 'Restore Staff Account',
        message: `Restore ${fullName} to Active status? They will regain system access.`,
        onConfirm: () => executeStatusChange(staff, 'Active', "Staff account restored.")
      });
    } else if (actionType === 'hard_delete') {
      setModal({
        isOpen: true, type: 'danger', title: 'PERMANENT DELETION',
        message: `Are you sure you want to completely erase ${fullName}'s account from the database? This CANNOT be undone.`,
        onConfirm: () => executeHardDelete(staff.user_ID)
      });
    }
  };

  const executeStatusChange = async (staff, newStatus, successMsg) => {
    setModal({ ...modal, isOpen: false });
    
    const submitData = new FormData();
    submitData.append('First_Name', staff.first_Name);
    submitData.append('Middle_Name', staff.middle_Name || '');
    submitData.append('Last_Name', staff.last_Name);
    submitData.append('Role', staff.role);
    submitData.append('Email', staff.email || '');
    submitData.append('Contact_Number', staff.contact_Number || '');
    submitData.append('Address', staff.address || '');
    submitData.append('Status', newStatus); 

    try {
      const res = await fetch(`http://localhost:5106/api/user/${staff.user_ID}`, { 
          method: 'PUT', body: submitData 
       });
      if (res.ok) {
        fetchStaff();
        triggerToast(successMsg);
      } else alert("Failed to update staff status.");
    } catch { alert("Network error."); }
  };

  const executeHardDelete = async (id) => {
    setModal({ ...modal, isOpen: false });
    try {
      const res = await fetch(`http://localhost:5106/api/user/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchStaff();
        triggerToast("Staff account permanently deleted.");
      } else alert("Failed to delete staff.");
    } catch { alert("Network error."); }
  };

  if (currentView === 'enroll') return <StaffEnrollmentView onBack={handleBackToDirectory} onSuccess={fetchStaff} />;
  if (currentView === 'edit' && selectedStaff) return <EditStaffView staff={selectedStaff} onBack={handleBackToDirectory} onSuccess={fetchStaff} onShowToast={triggerToast} />;
  if (currentView === 'profile' && selectedStaff) return <StaffProfileView staff={selectedStaff} onBack={handleBackToDirectory} onEdit={handleOpenEdit} />;

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
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Staff Directory</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage faculty and administrative system accounts.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
                <button onClick={() => setViewMode('active')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Users size={16} /> Active
                </button>
                <button onClick={() => setViewMode('inactive')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'inactive' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Archive size={16} /> Inactive
                </button>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <StaffToolbar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            filterRole={filterRole} 
            setFilterRole={setFilterRole}
            onEnroll={handleOpenEnroll}
            viewMode={viewMode} 
        />
        
        {isLoading ? (
          <div className="p-16 text-center flex flex-col items-center justify-center text-indigo-600 font-bold animate-pulse">
             <Loader2 size={32} className="mb-4 opacity-50 animate-spin" />
             Loading staff directory...
          </div>
        ) : (
          <StaffTable 
              staffList={sortedStaff} sortConfig={sortConfig} onSort={handleSort} 
              onZoom={setZoomedImage} onViewProfile={handleOpenProfile} 
              onEdit={handleOpenEdit} onDelete={handleActionClick} 
              viewMode={viewMode}
          />
        )}

      </div>
    </div>
  );
}