import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Users, LibrarySquare, Loader2, Layers, GraduationCap, ChevronDown, ChevronUp, CheckCircle2, Edit2, Trash2, ArrowUpDown, AlertCircle } from 'lucide-react';
import SectionRoster from './SectionRoster';
import SectionForm from './SectionForm';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import { useSectionsLogic } from './hooks/useSectionsLogic';

// THE FIX: Accept termId from the RegistrarPortal
export default function SectionsTab({ termId }) {
  const [selectedSection, setSelectedSection] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    filteredSections, isLoading,
    searchQuery, setSearchQuery,
    yearFilter, setYearFilter,
    courseFilter, setCourseFilter,
    modal, setModal,
    toastMessage, triggerToast,
    handleActionClick, fetchSections,
    uniqueYears, uniqueCourses, getFullProgramName,
    totalSections
  } = useSectionsLogic();

  const [sortConfig, setSortConfig] = useState({ key: 'section_Name', direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp size={14} className="text-blue-500" />
      : <ChevronDown size={14} className="text-blue-500" />;
  };

  const sortedSections = [...filteredSections].sort((a, b) => {
    let aValue = a[sortConfig.key] ?? '';
    let bValue = b[sortConfig.key] ?? '';

    if (sortConfig.key === 'year_Level' || sortConfig.key === 'student_Count') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    } else {
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCourseDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // STRICT BLOCK: Prevent accessing sections and enrollments without an active term
  if (!termId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center h-96 text-center animate-in fade-in">
        <AlertCircle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-black text-slate-800">No Academic Term Selected</h2>
        <p className="text-slate-500 max-w-md mt-2">
          Please select an active School Year and Semester from the header dropdown to view section rosters and process student enrollments.
        </p>
      </div>
    );
  }

  if (selectedSection) {
    return (
      <SectionRoster 
        section={selectedSection} 
        termId={termId} // THE FIX: Pass termId down so enrollments are correctly stamped!
        onBack={() => setSelectedSection(null)} 
        onEdit={() => { setSelectedSection(null); setEditingSection(selectedSection); setShowForm(true); }}
        onDelete={() => handleActionClick(selectedSection, 'hard_delete')}
      />
    );
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
      
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-100 bg-slate-800 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300">
          <CheckCircle2 className="text-emerald-400" size={20} />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      <ConfirmModal 
         isOpen={modal.isOpen} 
         type={modal.type} 
         title={modal.title} 
         message={modal.message} 
         onConfirm={modal.onConfirm} 
         onCancel={() => setModal({ ...modal, isOpen: false })} 
      />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Academic Sections</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage cohorts and handle student rosters for <span className="font-bold text-primary-600">{termId}</span>.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 font-bold text-sm flex items-center gap-2 shadow-sm">
            <Layers size={18} /> {filteredSections.length} of {totalSections} Sections
          </div>
        </div>
      </div>
      
      <div className="p-5 border border-slate-200 bg-white rounded-2xl shadow-sm flex flex-col gap-4">
        
        <div className="flex flex-col lg:flex-row justify-between gap-4">
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
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
           <div className="py-20 text-center flex flex-col items-center justify-center text-blue-600 font-bold animate-pulse">
             <Loader2 size={32} className="mb-4 opacity-50 animate-spin" />
             Loading academic sections...
           </div>
        ) : sortedSections.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center bg-slate-50/50">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"><Layers size={24} className="text-slate-400" /></div>
            <h3 className="text-lg font-black text-slate-700">No sections found</h3>
            <p className="text-slate-500 font-medium mt-1 max-w-sm">Try adjusting your filters or search query to find the section you are looking for.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-190">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b-2 border-slate-200 cursor-pointer select-none">
                  <th className="p-4 w-40 hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('section_Name')}>
                    <div className="flex items-center gap-1">Section {renderSortIcon('section_Name')}</div>
                  </th>
                  <th className="p-4 w-28 hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('campus')}>
                    <div className="flex items-center gap-1">Campus {renderSortIcon('campus')}</div>
                  </th>
                  <th className="p-4 min-w-72 hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('course')}>
                    <div className="flex items-center gap-1">Program {renderSortIcon('course')}</div>
                  </th>
                  <th className="p-4 w-28 text-center hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('year_Level')}>
                    <div className="flex items-center justify-center gap-1">Year {renderSortIcon('year_Level')}</div>
                  </th>
                  <th className="p-4 w-32 text-center hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('student_Count')}>
                    <div className="flex items-center justify-center gap-1">Students {renderSortIcon('student_Count')}</div>
                  </th>
                  <th className="p-4 w-36 text-right cursor-default outline-none">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedSections.map((section) => (
                  <tr
                    key={section.section_ID}
                    onClick={() => setSelectedSection(section)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-black text-sm border border-blue-200 whitespace-nowrap">
                        {section.section_Name}
                      </span>
                      <div className="text-[11px] font-bold text-slate-400 font-mono mt-1">{section.section_ID}</div>
                    </td>
                    <td className="p-4 font-black text-slate-600">{section.campus || 'SB'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <LibrarySquare size={16} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{getFullProgramName(section.course)}</p>
                          <p className="text-xs font-black text-blue-600 mt-0.5">{section.course}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-black text-slate-700">{section.year_Level}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border bg-slate-50 text-slate-700 border-slate-200">
                        <Users size={14} /> {section.student_Count || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedSection(section); }} className="p-2 bg-white text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg shadow-sm border border-slate-200 transition-colors" title="Open Roster">
                          <Users size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingSection(section); setShowForm(true); }} className="p-2 bg-white text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg shadow-sm border border-slate-200 transition-colors" title="Edit Section">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleActionClick(section, 'hard_delete'); }} className="p-2 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg shadow-sm border border-slate-200 transition-colors" title="Delete Section">
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