import { useState, useCallback, useEffect } from 'react';

export function useStudentDirectoryLogic() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'student_ID', direction: 'asc' });
  const [viewMode, setViewMode] = useState('active'); 
  
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
  const [toastMessage, setToastMessage] = useState('');

  // 1. ISOLATED MOUNT EFFECT (Fixes the ESLint Warning)
  // This runs strictly once on mount. No shared functions, no synchronous setStates.
  useEffect(() => {
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
      .catch(err => console.error("Failed to fetch students", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // 2. IMPERATIVE REFRESH FUNCTION 
  // Used only when we need to force a refresh after an action (Enroll/Edit/Delete)
  const fetchStudents = useCallback(async () => {
    setIsLoading(true); // Since it's a manual refresh, we always show the loader
    const currentFetchTime = Date.now(); 

    try {
      const res = await fetch('http://localhost:5106/api/student');
      const data = await res.json();
      if (Array.isArray(data)) {
        const dataWithCacheBuster = data.map(student => ({
          ...student,
          _cacheBuster: currentFetchTime 
        }));
        setStudents(dataWithCacheBuster); 
      }
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500); 
  };

  const executeHardDelete = async (id) => {
    setModal(prev => ({ ...prev, isOpen: false }));
    try {
      const res = await fetch(`http://localhost:5106/api/student/${id}`, { method: 'DELETE' });
      if (res.ok) { 
        fetchStudents(); 
        triggerToast("Student permanently deleted."); 
      } else {
        alert("Failed to delete.");
      }
    } catch { alert("Network error."); }
  };

  const executeStatusChange = async (student, newStatus, successMsg) => {
    setModal(prev => ({ ...prev, isOpen: false }));
    
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

  const handleArchiveClick = (student, actionType) => {
    const fullName = [student.first_Name, student.middle_Name, student.last_Name].filter(Boolean).join(' ');
    if (actionType === 'drop') {
      setModal({
        isOpen: true, type: 'danger', title: 'Drop Student Record',
        message: `Mark ${fullName} as Dropped? They will be moved to the archive.`,
        onConfirm: () => executeStatusChange(student, 'Dropped', "Student moved to archive.")
      });
    } else if (actionType === 'restore') {
      setModal({
        isOpen: true, type: 'info', title: 'Restore Student Record',
        message: `Restore ${fullName} to Regular status?`,
        onConfirm: () => executeStatusChange(student, 'Regular', "Student restored successfully.")
      });
    } else if (actionType === 'hard_delete') {
      setModal({
        isOpen: true, type: 'danger', title: 'PERMANENT DELETION',
        message: `Are you sure you want to completely erase ${fullName} from the database? This CANNOT be undone.`,
        onConfirm: () => executeHardDelete(student.student_ID)
      });
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // Compute filtered & sorted arrays directly in the hook
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

  return {
    isLoading, sortedStudents, 
    searchQuery, setSearchQuery, 
    filterStatus, setFilterStatus,
    sortConfig, handleSort, 
    viewMode, setViewMode, 
    modal, setModal, 
    toastMessage, triggerToast,
    handleArchiveClick, fetchStudents
  };
}