import { useState, useCallback, useEffect } from 'react';

export function useSectionsLogic() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'archived'

  // Modal & Toast States for Batch 3
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
  const [toastMessage, setToastMessage] = useState('');

  // 1. ISOLATED MOUNT EFFECT (Zero ESLint Warnings)
  useEffect(() => {
    let isMounted = true;
    
    fetch('http://localhost:5106/api/sections')
      .then(res => res.json())
      .then(data => {
        if (isMounted && Array.isArray(data)) setSections(data);
      })
      .catch(err => console.error("Failed to fetch sections:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
      
    return () => { isMounted = false; };
  }, []);

  // 2. IMPERATIVE REFRESH (Used after Create/Edit/Archive/Delete)
  const fetchSections = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5106/api/sections');
      const data = await res.json();
      if (Array.isArray(data)) setSections(data);
    } catch (err) {
      console.error("Failed to refresh sections:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toast Trigger
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500); 
  };

  // --- BATCH 3: ARCHIVE, RESTORE, AND DELETE LOGIC ---
  const executeStatusChange = async (section, newStatus, successMsg) => {
    setModal(prev => ({ ...prev, isOpen: false }));
    
    const payload = { ...section, status: newStatus };

    try {
      const res = await fetch(`http://localhost:5106/api/sections/${section.section_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchSections();
        triggerToast(successMsg);
      } else alert("Failed to update section status.");
    } catch { alert("Network error."); }
  };

  const executeHardDelete = async (id) => {
    setModal(prev => ({ ...prev, isOpen: false }));
    try {
      const res = await fetch(`http://localhost:5106/api/sections/${id}`, { method: 'DELETE' });
      if (res.ok) { 
        fetchSections(); 
        triggerToast("Section permanently deleted."); 
      } else {
        alert("Failed to delete section. It may have existing dependencies.");
      }
    } catch { alert("Network error."); }
  };

  const handleActionClick = (section, actionType) => {
    if (actionType === 'archive') {
      setModal({
        isOpen: true, type: 'danger', title: 'Archive Section',
        message: `Mark ${section.section_Name} as Archived? It will be hidden from the active directory.`,
        onConfirm: () => executeStatusChange(section, 'Archived', "Section moved to archive.")
      });
    } else if (actionType === 'restore') {
      setModal({
        isOpen: true, type: 'info', title: 'Restore Section',
        message: `Restore ${section.section_Name} to Active status?`,
        onConfirm: () => executeStatusChange(section, 'Active', "Section restored successfully.")
      });
    } else if (actionType === 'hard_delete') {
      setModal({
        isOpen: true, type: 'danger', title: 'PERMANENT DELETION',
        message: `Are you sure you want to completely erase ${section.section_Name}? This CANNOT be undone.`,
        onConfirm: () => executeHardDelete(section.section_ID)
      });
    }
  };

  // Helper Dictionary for Full Names
  const getFullProgramName = useCallback((code) => {
    const dict = {
      'IT': 'Bachelor of Science in Information Technology',
      'BSIT': 'Bachelor of Science in Information Technology',
      'CS': 'Bachelor of Science in Computer Science',
      'BSCS': 'Bachelor of Science in Computer Science',
      'BSA': 'Bachelor of Science in Accountancy',
      'BSEntrep': 'Bachelor of Science in Entrepreneurship',
      'BA': 'Bachelor of Arts'
    };
    return dict[code?.toUpperCase()] || code;
  }, []);

  // Extract unique filters dynamically
  const uniqueYears = ['All', ...Array.from(new Set(sections.map(s => s.year_Level))).filter(Boolean).sort()];
  const uniqueCourses = ['All', ...Array.from(new Set(sections.map(s => s.course))).filter(Boolean).sort()];

  // Filtering Logic
  const filteredSections = sections.filter(section => {
    const isArchived = section.status === 'Archived' || section.status === 'Inactive';
    const matchesViewMode = viewMode === 'active' ? !isArchived : isArchived;

    const matchesSearch = (section.section_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (section.course || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesYear = yearFilter === 'All' || section.year_Level?.toString() === yearFilter?.toString();
    const matchesCourse = courseFilter === 'All' || section.course === courseFilter;

    return matchesViewMode && matchesSearch && matchesYear && matchesCourse;
  });

  return {
    filteredSections, isLoading,
    searchQuery, setSearchQuery,
    yearFilter, setYearFilter,
    courseFilter, setCourseFilter,
    viewMode, setViewMode,
    modal, setModal,
    toastMessage, triggerToast,
    handleActionClick, fetchSections,
    uniqueYears, uniqueCourses, getFullProgramName
  };
}