import { useState, useEffect, useCallback } from 'react';

export function useCoursesLogic() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    fetch('http://localhost:5106/api/courses')
      .then(res => res.json())
      .then(data => { if (isMounted && Array.isArray(data)) setCourses(data); })
      .catch(err => console.error(err))
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5106/api/courses');
      const data = await res.json();
      if (Array.isArray(data)) setCourses(data);
    } catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500); 
  };

  const executeDelete = async (code) => {
    setModal(prev => ({ ...prev, isOpen: false }));
    try {
      const res = await fetch(`http://localhost:5106/api/courses/${code}`, { method: 'DELETE' });
      if (res.ok) { fetchCourses(); triggerToast("Course deleted successfully."); } 
      else { alert("Failed to delete. It may be in use by Sections."); }
    } catch { alert("Network error."); }
  };

  const confirmDelete = (course) => {
    setModal({
      isOpen: true, type: 'danger', title: 'Delete Academic Program',
      message: `Are you sure you want to delete ${course.course_Code}?`,
      onConfirm: () => executeDelete(course.course_Code)
    });
  };

  const filteredCourses = courses.filter(c => 
    c.course_Code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.course_Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    filteredCourses, isLoading, searchQuery, setSearchQuery,
    modal, setModal, toastMessage, triggerToast, confirmDelete, fetchCourses
  };
}