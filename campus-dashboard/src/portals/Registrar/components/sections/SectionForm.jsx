import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, PlusCircle, Edit2, GraduationCap, ChevronDown, MapPin } from 'lucide-react';
import { useSectionFormLogic } from './hooks/useSectionFormLogic';

export default function SectionForm({ section, onBack, onSuccess, onShowToast }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    formData, isEditing, isSubmitting, campuses,
    handleChange, setYearLevel, setCourse, handleSubmit,
    availablePrograms, getProgramName
  } = useSectionFormLogic(section, onSuccess, onShowToast);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-10">
      <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm w-full">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              {isEditing ? <><Edit2 className="text-amber-500" /> Edit Section Details</> : <><PlusCircle className="text-blue-600" /> Create New Section</>}
            </h2>
            <p className="text-sm font-bold text-slate-500">Configure academic cohort settings and program assignments.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 w-full">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Dynamic Campus Dropdown */}
            <div className="col-span-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Campus Location <span className="text-rose-500">*</span></label>
               <div className="relative">
                 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <select 
                    name="campus" 
                    value={formData.campus} 
                    onChange={handleChange} 
                    className="w-full pl-11 pr-4 py-3 h-13 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 shadow-sm transition-all appearance-none bg-white cursor-pointer"
                 >
                    {campuses.map(campus => (
                      <option key={campus.campus_Code || campus.code} value={campus.campus_Code || campus.code}>
                        {campus.campus_Name || campus.name}
                      </option>
                    ))}
                 </select>
                 <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
               </div>
            </div>

            {/* Custom Program Dropdown */}
            <div className="col-span-1 relative z-20" ref={dropdownRef}>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Academic Program</label>
               <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full flex items-center justify-between px-4 py-3 h-13 border border-slate-300 rounded-xl bg-white shadow-sm cursor-pointer transition-all hover:border-blue-400 focus:ring-2 focus:ring-blue-500">
                  <div className="flex items-center gap-3 truncate">
                     <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <GraduationCap size={16} className="text-blue-600" />
                     </div>
                     <div className="flex flex-col truncate">
                        <span className="font-black text-sm text-slate-800 leading-tight">{formData.course}</span>
                        <span className="text-[10px] font-bold text-slate-500 truncate">{getProgramName(formData.course)}</span>
                     </div>
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
               </div>
               {isDropdownOpen && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-50 origin-top animate-in fade-in slide-in-from-top-2">
                     <div className="p-3 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">Select Program</div>
                     {availablePrograms.map(prog => (
                        <div key={prog.code} onClick={() => { setCourse(prog.code); setIsDropdownOpen(false); }} className={`flex flex-col p-3 cursor-pointer transition-colors hover:bg-blue-50 group ${formData.course === prog.code ? 'bg-blue-50/50' : ''}`}>
                           <span className={`font-black text-sm group-hover:text-blue-700 ${formData.course === prog.code ? 'text-blue-700' : 'text-slate-800'}`}>{prog.code}</span>
                           <span className="text-xs font-bold text-slate-500 leading-tight mt-0.5">{prog.name}</span>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Pill-Shaped Year Selection */}
            <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Year Level</label>
               <div className="flex flex-wrap gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-inner">
                  {[1, 2, 3, 4, 5].map(year => {
                     const isSelected = parseInt(formData.year_Level) === year;
                     return (
                        <button key={year} type="button" onClick={() => setYearLevel(year)} className={`px-6 py-2.5 rounded-lg font-black text-sm transition-all ${isSelected ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200 border-blue-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                           Year {year}
                        </button>
                     );
                  })}
               </div>
            </div>

            {/* Section Letter Input */}
            <div className="col-span-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Section Letter <span className="text-rose-500">*</span></label>
               <input 
                  required 
                  type="text" 
                  name="section_Letter" 
                  value={formData.section_Letter} 
                  onChange={handleChange} 
                  maxLength="5"
                  placeholder="e.g. A" 
                  className="w-full px-4 py-3 h-13 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 shadow-sm transition-all uppercase" 
               />
            </div>

            {/* THE FIX: Placeholder updated to remove the hyphen */}
            <div className="col-span-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Section Name <span className="text-rose-500">*</span></label>
               <input 
                  required 
                  type="text" 
                  name="section_Name" 
                  value={formData.section_Name} 
                  onChange={handleChange} 
                  maxLength="20"
                  placeholder="e.g. SBIT1A" 
                  className="w-full px-4 py-3 h-13 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 shadow-sm transition-all uppercase" 
               />
            </div>

          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
               <Save size={18}/> {isSubmitting ? 'Saving...' : (isEditing ? 'Save Section Details' : 'Create Section')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
