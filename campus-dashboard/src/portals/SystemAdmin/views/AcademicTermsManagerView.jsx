import { useState, useEffect } from 'react';
import { Clock, Plus, Edit2, CheckCircle, XCircle, Loader2, AlertCircle, Power } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5106';
const TERMS_ENDPOINT = `${API_BASE_URL}/api/terms`;

export default function AcademicTermsManagerView() {
  const [terms, setTerms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // THE FIX: Trigger pattern for refreshing data without violating ESLint rules
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [formData, setFormData] = useState({
    term_ID: '',
    school_Year: '',
    semester: '1st Semester',
    start_Date: '',
    end_Date: '',
    is_Active: false
  });

  // THE FIX: Fetch logic strictly contained inside useEffect
  useEffect(() => {
    let isMounted = true;

    const loadTerms = async () => {
      try {
        const response = await fetch(TERMS_ENDPOINT);
        if (!response.ok) throw new Error('Failed to fetch academic terms from the server.');
        const data = await response.json();
        
        if (isMounted) {
          setTerms(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching terms:", err);
          setError(err.message || 'An unexpected error occurred while fetching terms.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTerms();

    // Cleanup function to prevent state updates on unmounted components
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]); // Re-runs cleanly whenever refreshTrigger changes

  const handleActivate = async (termId) => {
    setError(null);
    try {
      const response = await fetch(`${TERMS_ENDPOINT}/${termId}/activate`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to activate the selected term.');
      
      // THE FIX: Safely trigger a refresh without calling an external function
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Error activating term:", err);
      setError(err.message || 'An unexpected error occurred while activating the term.');
    }
  };

  const openModal = (term = null) => {
    if (term) {
      setEditingTerm(term);
      setFormData({
        term_ID: term.term_ID,
        school_Year: term.school_Year,
        semester: term.semester,
        start_Date: term.start_Date ? term.start_Date.split('T')[0] : '',
        end_Date: term.end_Date ? term.end_Date.split('T')[0] : '',
        is_Active: term.is_Active
      });
    } else {
      setEditingTerm(null);
      setFormData({
        term_ID: '',
        school_Year: '',
        semester: '1st Semester',
        start_Date: '',
        end_Date: '',
        is_Active: false
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTerm(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingTerm 
        ? `${TERMS_ENDPOINT}/${editingTerm.term_ID}`
        : TERMS_ENDPOINT;
      
      const method = editingTerm ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Term_ID: formData.term_ID,
          School_Year: formData.school_Year,
          Semester: formData.semester,
          Start_Date: formData.start_Date ? new Date(formData.start_Date).toISOString() : null,
          End_Date: formData.end_Date ? new Date(formData.end_Date).toISOString() : null,
          Is_Active: formData.is_Active
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save academic term.');
      }

      // THE FIX: Safely trigger a refresh
      setRefreshTrigger(prev => prev + 1);
      closeModal();
    } catch (err) {
      console.error("Error saving term:", err);
      setError(err.message || 'An unexpected error occurred while saving the term.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Clock className="text-primary-600" /> Academic Terms Management
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Configure the global active School Year and Semester for the entire campus.
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> Create New Term
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && !isModalOpen && (
        <div className="m-6 p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-3 font-bold text-sm">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* DATA TABLE */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="animate-spin mb-4 text-primary-500" size={32} />
            <p className="font-bold text-sm">Fetching Academic Terms...</p>
          </div>
        ) : terms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            <Clock size={48} className="mb-4 text-slate-300" />
            <p className="font-bold text-lg text-slate-500">No Academic Terms Found</p>
            <p className="text-sm mt-1">Create your first academic term to initialize the campus calendar.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-3 font-bold">Term ID</th>
                <th className="p-3 font-bold">School Year</th>
                <th className="p-3 font-bold">Semester</th>
                <th className="p-3 font-bold">Duration</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {terms.map(term => (
                <tr key={term.term_ID} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${term.is_Active ? 'bg-amber-50/30' : ''}`}>
                  <td className="p-3 font-bold text-slate-800 text-sm">{term.term_ID}</td>
                  <td className="p-3 font-bold text-slate-600 text-sm">{term.school_Year}</td>
                  <td className="p-3 font-bold text-slate-600 text-sm">{term.semester}</td>
                  <td className="p-3 text-sm text-slate-500">
                    {term.start_Date ? new Date(term.start_Date).toLocaleDateString() : 'TBA'} - 
                    {term.end_Date ? new Date(term.end_Date).toLocaleDateString() : 'TBA'}
                  </td>
                  <td className="p-3">
                    {term.is_Active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle size={12} /> ACTIVE GLOBALLY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                        <XCircle size={12} /> INACTIVE
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {!term.is_Active && (
                      <button 
                        onClick={() => handleActivate(term.term_ID)}
                        className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                        title="Set as Global Active Term"
                      >
                        <Power size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => openModal(term)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit Term Details"
                    >
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                <Clock className="text-primary-600" size={20} />
                {editingTerm ? 'Edit Academic Term' : 'Create New Academic Term'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-rose-500 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-2 text-sm font-bold">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Term ID (Unique Code)</label>
                  <input 
                    type="text" 
                    required 
                    disabled={!!editingTerm}
                    placeholder="e.g., AY2025-2026-SEM2"
                    value={formData.term_ID}
                    onChange={(e) => setFormData({...formData, term_ID: e.target.value.toUpperCase()})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">School Year</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., 2025-2026"
                    value={formData.school_Year}
                    onChange={(e) => setFormData({...formData, school_Year: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Semester</label>
                  <select 
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.start_Date}
                    onChange={(e) => setFormData({...formData, start_Date: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.end_Date}
                    onChange={(e) => setFormData({...formData, end_Date: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {!editingTerm && (
                <div className="mt-2 flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.is_Active}
                    onChange={(e) => setFormData({...formData, is_Active: e.target.checked})}
                    className="w-5 h-5 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-amber-800 cursor-pointer">
                    Activate Immediately (Deactivates other terms)
                  </label>
                </div>
              )}

              <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {editingTerm ? 'Update Term' : 'Save Term'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
