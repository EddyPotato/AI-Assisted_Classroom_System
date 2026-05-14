import { useState, useEffect } from 'react';

export function useAtRiskStudents() {
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Initial Load Effect (Linter-Safe)
  useEffect(() => {
    let isMounted = true; // Prevents memory leaks if component unmounts quickly

    const fetchInitialData = async () => {
      try {
        const response = await fetch('http://localhost:5106/api/principal/at-risk');
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setAtRiskStudents(data);
            setLoading(false); // State is set deep inside an async boundary
          }
        }
      } catch (error) {
        console.error("Failed to fetch at-risk students", error);
        if (isMounted) setLoading(false);
      }
    };

    fetchInitialData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array ensures this only runs once on mount

  // 2. Manual Refresh Function (For the Button)
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

  // 3. Admin Actions
  const handleExcuse = async (enrollmentId, studentName) => {
    if (!window.confirm(`Are you sure you want to excuse absences for ${studentName}? This will reset their count to 0.`)) return;
    
    try {
      const response = await fetch(`http://localhost:5106/api/principal/excuse/${enrollmentId}`, { method: 'PUT' });
      if (response.ok) {
        setAtRiskStudents(prev => prev.filter(s => s.Enrollment_ID !== enrollmentId));
      }
    } catch (error) {
      console.error("Failed to excuse student", error);
    }
  };

  const handleDrop = async (enrollmentId, studentName, section) => {
    if (!window.confirm(`DANGER: Are you sure you want to OFFICIALLY DROP ${studentName} from ${section}? This will remove them from the class roster permanently.`)) return;

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
    handleExcuse,
    handleDrop
  };
}