import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';
import StaffEnrollmentView from './StaffEnrollmentView';
import EditStaffView from './EditStaffView';
import StaffProfileView from './StaffProfileView';
import ConfirmModal from '../../../../components/ui/ConfirmModal';

import StaffToolbar from './StaffToolbar';
import StaffTable from './StaffTable';

export default function StaffDirectoryTab() {
  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'user_ID', direction: 'asc' });
  
  const [currentView, setCurrentView] = useState('directory'); 
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
  const [toastMessage, setToastMessage] = useState('');

  const fetchStaff = useCallback(() => {
    let isMounted = true;
    fetch('http://localhost:5106/api/user')
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(data => { if (isMounted && Array.isArray(data)) setStaffList(data); })
      .catch(err => {
        console.error("Failed to fetch staff:", err);
        if (isMounted) setStaffList([]); // Prevents undefined crashes!
      });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleOpenEnroll = () => setCurrentView('enroll');
  const handleOpenEdit = (staff) => { setSelectedStaff(staff); setCurrentView('edit'); };
  const handleOpenProfile = (staff) => { setSelectedStaff(staff); setCurrentView('profile'); };
  const handleBackToDirectory = () => { setSelectedStaff(null); setCurrentView('directory'); };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500); 
  };

  const filteredStaff = staffList.filter(staff => {
    const fullName = `${staff.first_Name} ${staff.middle_Name || ''} ${staff.last_Name}`.toLowerCase();
    const matchesSearch = staff.user_ID.toLowerCase().includes(searchQuery.toLowerCase()) || fullName.includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'All' || staff.role === filterRole;
    return matchesSearch && matchesRole;
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

  const handleDeleteClick = (staff) => {
    const fullName = [staff.first_Name, staff.middle_Name, staff.last_Name].filter(Boolean).join(' ');
    setModal({
      isOpen: true, 
      type: 'danger', 
      title: 'Delete Staff Record',
      message: `Are you sure you want to PERMANENTLY delete the account for ${fullName}? This action cannot be undone.`,
      onConfirm: () => executeDelete(staff.user_ID)
    });
  };

  const executeDelete = async (id) => {
    setModal({ ...modal, isOpen: false });
    try {
      const res = await fetch(`http://localhost:5106/api/user/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchStaff();
        triggerToast("Staff account deleted permanently.");
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

      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Staff Directory</h2>
        <p className="text-slate-500 mt-1 font-medium">Manage faculty and administrative system accounts.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <StaffToolbar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            filterRole={filterRole} 
            setFilterRole={setFilterRole}
            onEnroll={handleOpenEnroll}
        />
        <StaffTable 
            staffList={sortedStaff} sortConfig={sortConfig} onSort={handleSort} 
            onViewProfile={handleOpenProfile} onEdit={handleOpenEdit} onDelete={handleDeleteClick} 
        />
      </div>
    </div>
  );
}