import { useState } from 'react';

export function useCourseFormLogic(initialCourse, onSuccess, onShowToast) {
  const isEditing = !!initialCourse;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    course_Code: initialCourse?.course_Code || '',
    course_Name: initialCourse?.course_Name || '',
    department: initialCourse?.department || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'course_Code' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url = isEditing ? `http://localhost:5106/api/courses/${formData.course_Code}` : 'http://localhost:5106/api/courses';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        if (onShowToast) onShowToast(isEditing ? "Course updated." : "New course created!");
        onSuccess(); 
      } else { alert("Failed to save course."); }
    } catch (error) { 
      // THE FIX: The linter wants us to actually use the variable, 
      // so we log it to the console for debugging!
      console.error(error);
      alert("Network error."); 
    } 
    finally { setIsSubmitting(false); }
  };

  return { formData, isEditing, isSubmitting, handleChange, handleSubmit };
}