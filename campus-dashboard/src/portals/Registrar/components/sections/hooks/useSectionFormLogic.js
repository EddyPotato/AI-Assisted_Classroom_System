import { useState, useEffect } from 'react';

export function useSectionFormLogic(initialSection, onSuccess, onShowToast) {
  const isEditing = !!initialSection;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isManualOverride, setIsManualOverride] = useState(isEditing);

  const [campuses, setCampuses] = useState([
    { campus_Code: 'SB', campus_Name: 'San Bartolome (Main Campus)' },
    { campus_Code: 'SF', campus_Name: 'San Francisco (Satellite)' },
    { campus_Code: 'BA', campus_Name: 'Batasan (Satellite)' }
  ]);

  const [formData, setFormData] = useState({
    section_ID: initialSection?.section_ID || '',
    campus: initialSection?.campus || 'SB',
    course: initialSection?.course || 'IT',
    year_Level: initialSection?.year_Level || 1,
    section_Letter: initialSection?.section_Letter || 'A',
    section_Name: initialSection?.section_Name || ''
  });

  useEffect(() => {
    let isMounted = true;
    fetch('http://localhost:5106/api/campuses')
      .then(res => {
        if (!res.ok) throw new Error('API endpoint not ready');
        return res.json();
      })
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) setCampuses(data);
      })
      .catch(() => console.log("Using fallback QCU campus data.")); 
    
    return () => { isMounted = false; };
  }, []);

  // THE FIX: Intercept the input, force uppercase, and instantly generate the name
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Force Capitalization for Letter and Name
    let finalValue = value;
    if (name === 'section_Letter' || name === 'section_Name') {
      finalValue = value.toUpperCase();
    }

    if (name === 'section_Name') setIsManualOverride(true);

    setFormData(prev => {
      const nextData = { ...prev, [name]: finalValue };
      
      // Auto-generate instantly using the newly capitalized value
      if (name !== 'section_Name' && !isManualOverride) {
        nextData.section_Name = `${nextData.campus}${nextData.course}${nextData.year_Level}${nextData.section_Letter}`.toUpperCase();
      }
      return nextData;
    });
  };

  const setYearLevel = (level) => {
    setFormData(prev => {
      const nextData = { ...prev, year_Level: level };
      if (!isManualOverride) {
        nextData.section_Name = `${nextData.campus}${nextData.course}${nextData.year_Level}${nextData.section_Letter}`.toUpperCase();
      }
      return nextData;
    });
  };

  const setCourse = (courseCode) => {
    setFormData(prev => {
      const nextData = { ...prev, course: courseCode };
      if (!isManualOverride) {
        nextData.section_Name = `${nextData.campus}${nextData.course}${nextData.year_Level}${nextData.section_Letter}`.toUpperCase();
      }
      return nextData;
    });
  };

  const resetAutoName = () => {
    setIsManualOverride(false);
    setFormData(prev => ({
      ...prev,
      section_Name: `${prev.campus}${prev.course}${prev.year_Level}${prev.section_Letter}`.toUpperCase()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const url = isEditing ? `http://localhost:5106/api/sections/${formData.section_ID}` : 'http://localhost:5106/api/sections';
    const method = isEditing ? 'PUT' : 'POST';

    const payload = {
      campus: formData.campus,
      course: formData.course,
      year_Level: parseInt(formData.year_Level),
      section_Letter: formData.section_Letter,
      section_Name: formData.section_Name
    };

    if (isEditing) payload.section_ID = formData.section_ID;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (onShowToast) onShowToast(isEditing ? "Section updated successfully." : "New section created!");
        onSuccess(); 
      } else {
        alert("Failed to save section. Ensure the Section Name is unique and your backend allows editing the same row.");
      }
    } catch (error) { 
      console.error(error);
      alert("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availablePrograms = [
    { code: 'IT', name: 'Bachelor of Science in Information Technology' },
    { code: 'CS', name: 'Bachelor of Science in Computer Science' },
    { code: 'BSA', name: 'Bachelor of Science in Accountancy' },
    { code: 'BSEntrep', name: 'Bachelor of Science in Entrepreneurship' },
    { code: 'BA', name: 'Bachelor of Arts' }
  ];

  const getProgramName = (code) => {
    const program = availablePrograms.find(p => p.code === code);
    return program ? program.name : code;
  };

  return {
    formData, isEditing, isSubmitting, campuses, isManualOverride,
    handleChange, setYearLevel, setCourse, handleSubmit, resetAutoName,
    availablePrograms, getProgramName
  };
}
