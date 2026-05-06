import { useState, useEffect, useCallback } from 'react';

export function useSubjectsLogic() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Already initialized to true!
  
  const [searchQuery, setSearchQuery] = useState('');
  const [unitsFilter, setUnitsFilter] = useState('All');
  
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
  const [toastMessage, setToastMessage] = useState('');

  // 1. ISOLATED MOUNT EFFECT (Fixes the cascading render warning!)
  useEffect(() => {
    let isMounted = true;
    
    fetch('http://localhost:5106/api/subjects')
      .then(res => res.json())
      .then(data => {
        if (isMounted && Array.isArray(data)) setSubjects(data);
      })
      .catch(err => console.error("Failed to fetch initial subjects:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
      
    return () => { isMounted = false; };
  }, []);

  // 2. IMPERATIVE REFRESH (Used only after you Add, Edit, or Delete a subject)
  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5106/api/subjects');
      const data = await res.json();
      if (Array.isArray(data)) setSubjects(data);
    } catch (err) {
      console.error("Failed to refresh subjects:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500); 
  };

  const executeDelete = async (code) => {
    setModal(prev => ({ ...prev, isOpen: false }));
    try {
      const res = await fetch(`http://localhost:5106/api/subjects/${code}`, { method: 'DELETE' });
      if (res.ok) { 
        fetchSubjects(); 
        triggerToast("Subject deleted successfully."); 
      } else {
        alert("Failed to delete. It may be currently assigned to a Schedule.");
      }
    } catch { 
      alert("Network error."); 
    }
  };

  const confirmDelete = (subject) => {
    setModal({
      isOpen: true, type: 'danger', title: 'Delete Subject',
      message: `Are you sure you want to delete ${subject.subject_Code} - ${subject.title}?`,
      onConfirm: () => executeDelete(subject.subject_Code)
    });
  };

  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = sub.subject_Code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnits = unitsFilter === 'All' || sub.units.toString() === unitsFilter.toString();
    return matchesSearch && matchesUnits;
  });

  const uniqueUnits = ['All', ...Array.from(new Set(subjects.map(s => s.units))).sort((a,b) => a - b)];

  return {
    filteredSubjects, isLoading,
    searchQuery, setSearchQuery,
    unitsFilter, setUnitsFilter, uniqueUnits,
    modal, setModal, toastMessage, triggerToast,
    confirmDelete, fetchSubjects
  };
}