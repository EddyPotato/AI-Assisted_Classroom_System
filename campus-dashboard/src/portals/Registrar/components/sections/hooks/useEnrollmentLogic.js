import { useState, useCallback, useEffect } from 'react';

export function useEnrollmentLogic(sectionId) {
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, student: null });
  
  // THE FIX: Correctly declared state for the new View
  const [showAddStudentsView, setShowAddStudentsView] = useState(false);

  const fetchRoster = useCallback(() => {
    fetch(`http://localhost:5106/api/sections/${sectionId}/students`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setEnrolledStudents(data); })
      .catch(err => console.error(err));
  }, [sectionId]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  const handleAddStudents = async (newStudents) => {
    const studentIds = newStudents.map(s => s.student_ID);
    try {
      const res = await fetch(`http://localhost:5106/api/sections/${sectionId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentIds)
      });
      if (res.ok) fetchRoster();
    } catch (err) {
      console.error(err);
    }
  };

  const executeRemoveStudent = async () => {
    try {
      const res = await fetch(`http://localhost:5106/api/sections/${sectionId}/students/${confirmModal.student.student_ID}`, { method: 'DELETE' });
      if (res.ok) setEnrolledStudents(prev => prev.filter(s => s.student_ID !== confirmModal.student.student_ID));
    } catch (err) {
      console.error(err);
    }
    setConfirmModal({ isOpen: false, student: null });
  };

  return {
    enrolledStudents,
    confirmModal,
    setConfirmModal,
    // THE FIX: Exporting the correct state names
    showAddStudentsView,
    setShowAddStudentsView,
    handleAddStudents,
    executeRemoveStudent
  };
}