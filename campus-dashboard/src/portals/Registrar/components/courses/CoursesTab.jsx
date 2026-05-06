import { useState } from 'react';
import { Search, Plus, Loader2, GraduationCap, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import CourseForm from './CourseForm';
import { useCoursesLogic } from './hooks/useCoursesLogic';

export default function CoursesTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const {
    filteredCourses, isLoading, searchQuery, setSearchQuery,
    modal, setModal, toastMessage, triggerToast, confirmDelete, fetchCourses
  } = useCoursesLogic();

  if (showForm) {
    return (
       <CourseForm 
          course={editingCourse} onBack={() => { setShowForm(false); setEditingCourse(null); }} 
          onSuccess={() => { setShowForm(false); setEditingCourse(null); fetchCourses(); }}
          onShowToast={triggerToast}
       />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative mt-4">
      
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-100 bg-slate-800 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300">
          <CheckCircle2 className="text-emerald-400" size={20} />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      <ConfirmModal 
         isOpen={modal.isOpen} type={modal.type} title={modal.title} 
         message={modal.message} onConfirm={modal.onConfirm} 
         onCancel={() => setModal({ ...modal, isOpen: false })} 
      />

      <div className="p-5 border border-slate-200 bg-white rounded-2xl shadow-sm flex flex-col lg:flex-row justify-between gap-4">
         <div className="relative w-full lg:w-96 shrink-0">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input
             type="text" placeholder="Search Program Code or Name..."
             value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
           />
           {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50 bg-slate-50">
                <X size={16} strokeWidth={2.5} />
              </button>
           )}
         </div>

         <button onClick={() => { setEditingCourse(null); setShowForm(true); }} className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0">
           <Plus size={18} /> Add Program
         </button>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
           <div className="p-16 text-center flex flex-col items-center justify-center text-blue-600 font-bold animate-pulse">
             <Loader2 size={32} className="mb-4 opacity-50 animate-spin" />
             Loading programs database...
           </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center bg-slate-50/50">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"><GraduationCap size={24} className="text-slate-400" /></div>
            <h3 className="text-lg font-black text-slate-700">No programs found</h3>
            <p className="text-slate-500 font-medium mt-1">Try adjusting your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Code</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Full Program Name</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map(course => (
                  <tr key={course.course_Code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-black text-sm border border-blue-200 whitespace-nowrap">
                        {course.course_Code}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">{course.course_Name}</td>
                    <td className="py-4 px-6 font-bold text-slate-500">{course.department || '—'}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditingCourse(course); setShowForm(true); }} className="p-2 bg-white text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg shadow-sm border border-slate-200 transition-colors" title="Edit Program">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => confirmDelete(course)} className="p-2 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg shadow-sm border border-slate-200 transition-colors" title="Delete Program">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}