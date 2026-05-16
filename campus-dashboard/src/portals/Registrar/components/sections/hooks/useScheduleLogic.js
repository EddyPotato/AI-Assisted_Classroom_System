import { useState, useEffect } from 'react';

export function useScheduleLogic(sectionId, termId) {
  const [scheduleData, setScheduleData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [confirmSchedModal, setConfirmSchedModal] = useState({ isOpen: false, scheduleId: null });
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [schedSortConfig, setSchedSortConfig] = useState({ key: 'subject_Code', direction: 'asc' });
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    // THE FIX: The fetch logic is now completely inlined inside the useEffect body.
    // This removes the need for useCallback and perfectly satisfies the ESLint effect dependency rules.
    const loadSchedules = async () => {
      // Microtask yield before ANY state updates to guarantee asynchronous execution
      await Promise.resolve();
      if (!isMounted) return;

      setIsLoading(true);

      // Abort if the parent component hasn't provided a valid term or section context yet
      if (!sectionId || !termId) {
         if (isMounted) {
             setScheduleData([]);
             setIsLoading(false);
         }
         return;
      }

      try {
        // Fetch from the C# controller
        const response = await fetch(`http://localhost:5000/api/schedules?termId=${termId}`);
        if (!response.ok) throw new Error('Failed to fetch schedules for the active term.');
        const data = await response.json();

        if (isMounted) {
          // Filter the globally fetched term schedules down to just this specific section
          const sectionSchedules = Array.isArray(data) ? data.filter(s => s.section_ID === sectionId) : [];
          setScheduleData(sectionSchedules);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching section schedules:", err);
          setError(err.message || 'An unexpected error occurred while fetching schedules.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSchedules();

    return () => {
      isMounted = false;
    };
  }, [sectionId, termId, refreshTrigger]);

  const fetchSchedule = () => setRefreshTrigger(prev => prev + 1);

  const handleSchedSort = (key) => {
    setSchedSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleEditSchedule = (sched) => {
    setEditingSchedule(sched);
    setShowScheduleForm(true);
  };

  const executeDeleteSchedule = async () => {
    if (!confirmSchedModal.scheduleId) return;
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/schedules/${confirmSchedModal.scheduleId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete schedule.');
      }

      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Error deleting schedule:", err);
      setError(err.message || 'An unexpected error occurred while deleting the schedule.');
    } finally {
      setConfirmSchedModal({ isOpen: false, scheduleId: null });
    }
  };

  return {
    scheduleData,
    isLoading,
    error,
    confirmSchedModal,
    setConfirmSchedModal,
    showScheduleForm,
    setShowScheduleForm,
    editingSchedule,
    setEditingSchedule,
    schedSortConfig,
    handleSchedSort,
    handleEditSchedule,
    executeDeleteSchedule,
    fetchSchedule
  };
}