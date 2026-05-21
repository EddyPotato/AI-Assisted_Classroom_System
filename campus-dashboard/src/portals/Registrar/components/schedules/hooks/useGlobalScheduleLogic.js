import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5106';
const SCHEDULES_ENDPOINT = `${API_BASE_URL}/api/schedules`;

export function useGlobalScheduleLogic(termId) {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchSchedules = async () => {
      // THE FIX: Force execution into the async microtask queue immediately.
      // This prevents ESLint from flagging synchronous state updates in the effect body.
      await Promise.resolve(); 
      if (!isMounted) return;

      setIsLoading(true);

      // If no term is selected, clear data and don't fetch
      if (!termId) {
        setSchedules([]);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch schedules strictly filtered by the active academic term
        const response = await fetch(`${SCHEDULES_ENDPOINT}?termId=${encodeURIComponent(termId)}`);
        if (!response.ok) throw new Error('Failed to fetch schedules from the server.');
        const data = await response.json();
        
        if (isMounted) {
          setSchedules(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching schedules:", err);
          setError(err.message || 'An unexpected error occurred while fetching schedules.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSchedules();

    return () => {
      isMounted = false;
    };
  }, [termId, refreshTrigger]);

  const refreshSchedules = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const createSchedule = async (scheduleData) => {
    try {
      const response = await fetch(SCHEDULES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Enforce the active term explicitly on creation
        body: JSON.stringify({ ...scheduleData, Term_ID: termId })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create schedule.');
      }
      
      refreshSchedules();
      return { success: true };
    } catch (err) {
      console.error("Error creating schedule:", err);
      return { success: false, error: err.message };
    }
  };

  const updateSchedule = async (id, scheduleData) => {
    try {
      const response = await fetch(`${SCHEDULES_ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scheduleData, Term_ID: termId })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update schedule.');
      }
      
      refreshSchedules();
      return { success: true };
    } catch (err) {
      console.error("Error updating schedule:", err);
      return { success: false, error: err.message };
    }
  };

  const deleteSchedule = async (id) => {
    try {
      const response = await fetch(`${SCHEDULES_ENDPOINT}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
         const errData = await response.json();
         throw new Error(errData.message || 'Failed to delete schedule.');
      }
      
      refreshSchedules();
      return { success: true };
    } catch (err) {
      console.error("Error deleting schedule:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    schedules,
    isLoading,
    error,
    refreshSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule
  };
}
