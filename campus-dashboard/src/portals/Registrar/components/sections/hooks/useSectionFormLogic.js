import { useState } from 'react';

export function useSectionFormLogic(initialSection, onSuccess, onShowToast) {
  const isEditing = !!initialSection;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialized to strictly match your Oracle Database schema
  const [formData, setFormData] = useState({
    section_ID: initialSection?.section_ID || '',
    campus: initialSection?.campus || 'SB', // Fixed: 'SB' fits the VARCHAR2(10) limit
    course: initialSection?.course || 'IT',
    year_Level: initialSection?.year_Level || 1,
    section_Letter: initialSection?.section_Letter || 'A',
    section_Name: initialSection?.section_Name || '',
    status: initialSection?.status || 'Active' // Kept for UI toggles, but removed from payload
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const setYearLevel = (level) => setFormData({ ...formData, year_Level: level });
  const setCourse = (courseCode) => setFormData({ ...formData, course: courseCode });
  const setStatus = (newStatus) => setFormData({ ...formData, status: newStatus });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const url = isEditing ? `http://localhost:5106/api/sections/${formData.section_ID}` : 'http://localhost:5106/api/sections';
    const method = isEditing ? 'PUT' : 'POST';

    // THE FIX: We explicitly build the payload to ONLY include your 6 database columns.
    // This prevents the backend from crashing when it receives the 'status' field.
    const payload = {
      section_ID: formData.section_ID || `SEC-${Math.floor(1000 + Math.random() * 9000)}`,
      campus: formData.campus,
      course: formData.course,
      year_Level: parseInt(formData.year_Level),
      section_Letter: formData.section_Letter,
      section_Name: formData.section_Name
    };

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
        alert("Failed to save section. Ensure the Section Name is unique and does not already exist.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Is your C# backend running?");
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
    formData, isEditing, isSubmitting,
    handleChange, setYearLevel, setCourse, setStatus, handleSubmit,
    availablePrograms, getProgramName
  };
}