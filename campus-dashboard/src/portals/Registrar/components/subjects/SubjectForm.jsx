import { ArrowLeft, Save, PlusCircle, Edit2, Book } from 'lucide-react';
import { useSubjectFormLogic } from './hooks/useSubjectFormLogic';

export default function SubjectForm({ subject, onBack, onSuccess, onShowToast }) {
  const { formData, isEditing, isSubmitting, handleChange, setUnits, handleSubmit } = useSubjectFormLogic(subject, onSuccess, onShowToast);

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-10">
      <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm w-full">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              {isEditing ? <><Edit2 className="text-amber-500" /> Edit Subject</> : <><PlusCircle className="text-blue-600" /> Add New Subject</>}
            </h2>
            <p className="text-sm font-bold text-slate-500">Configure academic courses and prerequisites.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 w-full">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="col-span-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject Code <span className="text-rose-500">*</span></label>
               <input 
                  required disabled={isEditing} // Cannot change PK once created
                  type="text" name="subject_Code" value={formData.subject_Code} onChange={handleChange} 
                  placeholder="e.g. IPT101" 
                  className="w-full px-4 py-3 h-13 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 shadow-sm transition-all disabled:opacity-50 disabled:bg-slate-50" 
               />
               {isEditing && <p className="text-[10px] text-slate-400 mt-1 font-bold">Subject Code cannot be changed once created.</p>}
            </div>

            <div className="col-span-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject Title <span className="text-rose-500">*</span></label>
               <input 
                  required type="text" name="title" value={formData.title} onChange={handleChange} 
                  placeholder="e.g. Integrative Programming and Technologies 1" 
                  className="w-full px-4 py-3 h-13 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 shadow-sm transition-all" 
               />
            </div>

            <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Credit Units</label>
               <div className="flex flex-wrap gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-inner">
                  {[1, 2, 3, 4, 5, 6].map(unit => {
                     const isSelected = parseInt(formData.units) === unit;
                     return (
                        <button key={unit} type="button" onClick={() => setUnits(unit)} className={`px-6 py-2.5 rounded-lg font-black text-sm transition-all ${isSelected ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200 border-blue-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                           {unit} Units
                        </button>
                     );
                  })}
               </div>
            </div>

            <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Prerequisites</label>
               <input 
                  type="text" name="prerequisites" value={formData.prerequisites || ''} onChange={handleChange} 
                  placeholder="e.g. CC105, PF101 (Leave blank if none)" 
                  className="w-full px-4 py-3 h-13 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 shadow-sm transition-all" 
               />
            </div>

          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
               <Save size={18}/> {isSubmitting ? 'Saving...' : (isEditing ? 'Save Subject Details' : 'Create Subject')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}