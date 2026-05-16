import { useState, useEffect } from 'react';

export function useEnrollmentLogic(sectionId, termId) {
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, student: null });
  const [showAddStudentsView, setShowAddStudentsView] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadRoster = async () => {
      // THE FIX: Microtask yield before ANY state updates
      await Promise.resolve();
      if (!isMounted) return;

      setIsLoading(true);

      if (!sectionId || !termId) {
         setEnrolledStudents([]);
         setIsLoading(false);
         return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/sections/${sectionId}/students?termId=${termId}`);
        if (!res.ok) throw new Error('Failed to fetch section roster for the active term.');
        const data = await res.json();
        
        if (isMounted) {
          setEnrolledStudents(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching roster:", err);
          setError(err.message || 'An unexpected error occurred while fetching the roster.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRoster();

    return () => {
      isMounted = false;
    };
  }, [sectionId, termId, refreshTrigger]);

  const handleAddStudents = async (newStudents) => {
    if (!termId) return;
    setError(null);

    try {
      await Promise.all(newStudents.map(s => 
        fetch(`http://localhost:5000/api/enrollments/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              Student_ID: s.student_ID, 
              Section_ID: sectionId, 
              Term_ID: termId 
          })
        }).then(async res => {
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || `Failed to enroll student ${s.student_ID}.`);
            }
        })
      ));
      
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Error adding students:", err);
      setError(err.message || 'An unexpected error occurred while enrolling students.');
    }
  };

  const executeRemoveStudent = async () => {
    if (!confirmModal.student || !termId) return;
    setError(null);

    try {
      const url = `http://localhost:5000/api/sections/${sectionId}/students/${confirmModal.student.student_ID}?termId=${termId}`;
      const response = await fetch(url, { method: 'DELETE' });

      if (!response.ok) {
         const errData = await response.json();
         throw new Error(errData.message || 'Failed to remove student from section.');
      }
      
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Error removing student:", err);
      setError(err.message || 'An unexpected error occurred while removing the student.');
    } finally {
      setConfirmModal({ isOpen: false, student: null });
    }
  };

  return {
    enrolledStudents,
    isLoading,
    error,
    confirmModal,
    setConfirmModal,
    showAddStudentsView,
    setShowAddStudentsView,
    handleAddStudents,
    executeRemoveStudent
  };
}