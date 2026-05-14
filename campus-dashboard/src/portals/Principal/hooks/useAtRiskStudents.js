import { useState, useEffect } from 'react';

export function useAtRiskStudents() {
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; 

    const fetchInitialData = async () => {
      try {
        const response = await fetch('http://localhost:5106/api/principal/at-risk');
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setAtRiskStudents(data);
            setLoading(false); 
          }
        }
      } catch (error) {
        console.error("Failed to fetch at-risk students", error);
        if (isMounted) setLoading(false);
      }
    };

    fetchInitialData();
    return () => { isMounted = false; };
  }, []); 

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5106/api/principal/at-risk');
      if (response.ok) {
        const data = await response.json();
        setAtRiskStudents(data);
      }
    } catch (error) {
      console.error("Failed to refresh at-risk students", error);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Fetch detailed dates for the modal ---
  const fetchAbsenceDetails = async (enrollmentId) => {
    try {
      const response = await fetch(`http://localhost:5106/api/principal/absences/${enrollmentId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Failed to fetch absence details", error);
    }
    return [];
  };

  const handleExcuse = async (enrollmentId) => {
    try {
      const response = await fetch(`http://localhost:5106/api/principal/excuse/${enrollmentId}`, { method: 'PUT' });
      if (response.ok) {
        setAtRiskStudents(prev => prev.filter(s => s.Enrollment_ID !== enrollmentId));
      }
    } catch (error) {
      console.error("Failed to excuse student", error);
    }
  };

  const handleDrop = async (enrollmentId) => {
    try {
      const response = await fetch(`http://localhost:5106/api/principal/drop/${enrollmentId}`, { method: 'DELETE' });
      if (response.ok) {
        setAtRiskStudents(prev => prev.filter(s => s.Enrollment_ID !== enrollmentId));
      }
    } catch (error) {
      console.error("Failed to drop student", error);
    }
  };

  return {
    atRiskStudents,
    loading,
    fetchAtRiskStudents: handleManualRefresh,
    fetchAbsenceDetails,
    handleExcuse,
    handleDrop
  };
}