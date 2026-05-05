import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Users, LibrarySquare, Loader2, Archive, Layers, GraduationCap, ChevronDown, CheckCircle2, Edit2, RefreshCw, Trash2 } from 'lucide-react';
import SectionRoster from './SectionRoster';
import SectionForm from './SectionForm';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import { useSectionsLogic } from './hooks/useSectionsLogic';

export default function SectionsTab() {
  const [selectedSection, setSelectedSection] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Bring in the logic safely
  const {
    filteredSections, isLoading,
    searchQuery, setSearchQuery,
    yearFilter, setYearFilter,
    courseFilter, setCourseFilter,
    viewMode, setViewMode,
    modal, setModal,
    toastMessage, triggerToast,
    handleActionClick, fetchSections,
    uniqueYears, uniqueCourses, getFullProgramName
  } = useSectionsLogic();

  // Close custom dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCourseDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- ROUTING INTERCEPTS ---
  if (selectedSection) {
    return <SectionRoster section={selectedSection} onBack={() => setSelectedSection(null)} />;
  }

  if (showForm) {
    return (
       <SectionForm 
          section={editingSection} 
          onBack={() => { setShowForm(false); setEditingSection(null); }} 
          onSuccess={() => { setShowForm(false); setEditingSection(null); fetchSections(); }}
          onShowToast={triggerToast}
       />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-100 bg-slate-800 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300">
          <CheckCircle2 className="text-emerald-400" size={20} />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal 
         isOpen={modal.isOpen} 
         type={modal.type} 
         title={modal.title} 
         message={modal.message} 
         onConfirm={modal.onConfirm} 
         onCancel={() => setModal({ ...modal, isOpen: false })} 
      />

      {/* Header & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Academic Sections</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage cohorts, assign advisers, and handle student rosters.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200 shadow-inner">
             <button onClick={() => setViewMode('active')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Layers size={16} /> Active
             </button>
             <button onClick={() => setViewMode('archived')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'archived' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Archive size={16} /> Archived
             </button>
          </div>
        </div>
      </div>
      
      {/* Search & Filters Toolbar */}
      <div className="p-5 border border-slate-200 bg-white rounded-2xl shadow-sm flex flex-col gap-4">
        
        <div className="flex flex-col lg:flex-row justify-between gap-4">
           {/* Search Bar */}
           <div className="relative w-full lg:w-96 shrink-0">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input
               type="text"
               placeholder="Search by Section Name..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
             />
           </div>

           {/* Custom Built-In Course Dropdown */}
           <div className="relative w-full lg:w-72 shrink-0 z-20" ref={dropdownRef}>
              <div 
                 onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                 className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer shadow-sm hover:bg-white transition-all focus:ring-2 focus:ring-blue-500"
              >
                 <div className="flex items-center gap-2 truncate">
                    <GraduationCap size={18} className="text-blue-500 shrink-0" />
                    <span className="truncate">{courseFilter === 'All' ? 'All Programs' : getFullProgramName(courseFilter)}</span>
                 </div>
                 <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isCourseDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isCourseDropdownOpen && (
                 <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-50 origin-top animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">Filter by Program</div>
                    {uniqueCourses.map(course => (
                       <div 
                          key={course} 
                          onClick={() => { setCourseFilter(course); setIsCourseDropdownOpen(false); }}
                          className={`flex flex-col p-3 cursor-pointer transition-colors hover:bg-blue-50 group ${courseFilter === course ? 'bg-blue-50/50' : ''}`}
                       >
                          <span className={`font-black text-sm group-hover:text-blue-700 ${courseFilter === course ? 'text-blue-700' : 'text-slate-800'}`}>
                             {course === 'All' ? 'All Academic Programs' : course}
                          </span>
                          {course !== 'All' && (
                             <span className="text-[10px] font-bold text-slate-500 leading-tight mt-0.5">
                                {getFullProgramName(course)}
                             </span>
                          )}
                       </div>
                    ))}
                 </div>
              )}
           </div>

           <button 
             onClick={() => { setEditingSection(null); setShowForm(true); }} 
             className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
           >
             <Plus size={18} /> Create Section
           </button>
        </div>

        {/* Pill-Shaped Year Selection Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide border-t border-slate-100 pt-4">
           <span className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap mr-2">Year Level:</span>
           <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner shrink-0">
              {uniqueYears.map(year => (
                 <button
                    key={year}
                    onClick={() => setYearFilter(year)}
                    className={`px-5 py-1.5 rounded-lg font-black text-sm transition-all whitespace-nowrap ${
                       yearFilter === year 
                          ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/50' 
                          : 'text-slate-500 hover:text-slate-700'
                    }`}
                 >
                    {year === 'All' ? 'All Levels' : `Year ${year}`}
                 </button>
              ))}
           </div>
        </div>

      </div>
      
      {/* Grid Rendering */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
           <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-blue-600 font-bold bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse">
             <Loader2 size={32} className="mb-4 opacity-50 animate-spin" />
             Loading academic sections...
           </div>
        ) : filteredSections.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"><Layers size={24} className="text-slate-400" /></div>
            <h3 className="text-lg font-black text-slate-700">No sections found</h3>
            <p className="text-slate-500 font-medium mt-1 max-w-sm">Try adjusting your filters or search query to find the section you are looking for.</p>
          </div>
        ) : (
          filteredSections.map((section) => (
            <div 
              key={section.section_ID} 
              onClick={() => setSelectedSection(section)}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col relative overflow-hidden"
            >
              {/* ACTION BUTTONS (Hidden until hover) */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {viewMode === 'active' ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setEditingSection(section); setShowForm(true); }} className="p-2 bg-white text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg shadow-sm border border-slate-200 transition-colors" title="Edit Section">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleActionClick(section, 'archive'); }} className="p-2 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg shadow-sm border border-slate-200 transition-colors" title="Archive Section">
                      <Archive size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); handleActionClick(section, 'restore'); }} className="p-2 bg-white text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg shadow-sm border border-slate-200 transition-colors" title="Restore Section">
                      <RefreshCw size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleActionClick(section, 'hard_delete'); }} className="p-2 bg-white text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg shadow-sm border border-slate-200 transition-colors" title="Permanently Delete">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>

              <div className="flex justify-between items-start mb-4 pr-16">
                <div className={`px-3 py-1.5 rounded-lg font-black text-xl tracking-tight border transition-colors ${viewMode === 'active' ? 'bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                  {section.section_Name}
                </div>
              </div>
              
              <div className="space-y-4 flex-1">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><LibrarySquare size={14}/> Program & Level</p>
                  <p className="font-bold text-slate-700 leading-tight pr-2">{getFullProgramName(section.course)}</p>
                  <p className="text-sm font-black text-blue-600 mt-0.5">Year {section.year_Level}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-500 font-bold text-sm">
                  <Users size={16} className="text-slate-400" />
                  {section.student_Count || 0} Enrolled Students
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}