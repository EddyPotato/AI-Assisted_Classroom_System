import { ArrowLeft, Save, PlusCircle, Edit2 } from 'lucide-react';
import { useCourseFormLogic } from './hooks/useCourseFormLogic';

export default function CourseForm({ course, onBack, onSuccess, onShowToast }) {
  const { formData, isEditing, isSubmitting, handleChange, handleSubmit } = useCourseFormLogic(course, onSuccess, onShowToast);

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-10">
      <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm w-full">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              {isEditing ? <><Edit2 className="text-amber-500" /> Edit Program Details</> : <><PlusCircle className="text-blue-600" /> Add Academic Program</>}
            </h2>
            <p className="text-sm font-bold text-slate-500">Configure academic courses and departments.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 w-full">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Program Code <span className="text-rose-500">*</span></label>
               <input 
                  required disabled={isEditing} type="text" name="course_Code" value={formData.course_Code} onChange={handleChange} 
                  placeholder="e.g. BSIT" 
                  className="w-full px-4 py-3 h-13 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 shadow-sm transition-all disabled:opacity-50 disabled:bg-slate-50" 
               />
            </div>
            <div className="col-span-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Department</label>
               <input 
                  type="text" name="department" value={formData.department} onChange={handleChange} 
                  placeholder="e.g. College of Computer Studies" 
                  className="w-full px-4 py-3 h-13 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 shadow-sm transition-all" 
               />
            </div>
            <div className="col-span-1 md:col-span-2">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Program Name <span className="text-rose-500">*</span></label>
               <input 
                  required type="text" name="course_Name" value={formData.course_Name} onChange={handleChange} 
                  placeholder="e.g. Bachelor of Science in Information Technology" 
                  className="w-full px-4 py-3 h-13 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 shadow-sm transition-all" 
               />
            </div>
          </div>
          <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
               <Save size={18}/> {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Program')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}