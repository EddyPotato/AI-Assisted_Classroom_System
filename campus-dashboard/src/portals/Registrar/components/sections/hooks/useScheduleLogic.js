import { useState, useCallback, useEffect } from 'react';

export function useScheduleLogic(sectionId) {
  const [scheduleData, setScheduleData] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [confirmSchedModal, setConfirmSchedModal] = useState({ isOpen: false, scheduleId: null });
  const [schedSortConfig, setSchedSortConfig] = useState({ key: 'subject_Code', direction: 'asc' });

  const fetchSchedule = useCallback(() => {
    fetch(`http://localhost:5106/api/sections/${sectionId}/schedule`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setScheduleData(data); })
      .catch(err => console.error(err));
  }, [sectionId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleEditSchedule = (sched) => {
    setEditingSchedule(sched);
    setShowScheduleForm(true);
  };

  const executeDeleteSchedule = async () => {
    try {
      await fetch(`http://localhost:5106/api/schedules/${confirmSchedModal.scheduleId}`, { method: 'DELETE' });
      fetchSchedule();
    } catch (err) {
      console.error(err);
    }
    setConfirmSchedModal({ isOpen: false, scheduleId: null });
  };

  const handleSchedSort = (key) => {
    let direction = 'asc';
    if (schedSortConfig.key === key && schedSortConfig.direction === 'asc') direction = 'desc';
    setSchedSortConfig({ key, direction });
  };

  const sortedSchedule = (filteredSchedule) => {
    return [...filteredSchedule].sort((a, b) => {
      if (!schedSortConfig.key) return 0;
      const aValue = a[schedSortConfig.key] || '';
      const bValue = b[schedSortConfig.key] || '';
      if (aValue < bValue) return schedSortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return schedSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  return {
    scheduleData,
    showScheduleForm,
    setShowScheduleForm,
    editingSchedule,
    setEditingSchedule,
    confirmSchedModal,
    setConfirmSchedModal,
    schedSortConfig,
    fetchSchedule,
    handleEditSchedule,
    executeDeleteSchedule,
    handleSchedSort,
    sortedSchedule
  };
}
