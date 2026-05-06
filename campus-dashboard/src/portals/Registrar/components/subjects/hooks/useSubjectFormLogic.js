import { useState } from 'react';

export function useSubjectFormLogic(initialSubject, onSuccess, onShowToast) {
  const isEditing = !!initialSubject;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subject_Code: initialSubject?.subject_Code || '',
    title: initialSubject?.title || '',
    prerequisites: initialSubject?.prerequisites || '',
    units: initialSubject?.units || 3
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Force uppercase on the Subject Code
    const finalValue = name === 'subject_Code' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const setUnits = (units) => setFormData(prev => ({ ...prev, units }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const url = isEditing ? `http://localhost:5106/api/subjects/${formData.subject_Code}` : 'http://localhost:5106/api/subjects';
    const method = isEditing ? 'PUT' : 'POST';

    // Convert empty prerequisites string back to null for the DB
    const payload = {
        ...formData,
        prerequisites: formData.prerequisites.trim() === '' ? null : formData.prerequisites.trim()
    };

    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (onShowToast) onShowToast(isEditing ? "Subject updated." : "New subject created!");
        onSuccess(); 
      } else {
        const errorText = await res.text();
        alert(`Failed to save: ${errorText}`);
      }
    } catch (error) { 
      console.error(error);
      alert("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { formData, isEditing, isSubmitting, handleChange, setUnits, handleSubmit };
}