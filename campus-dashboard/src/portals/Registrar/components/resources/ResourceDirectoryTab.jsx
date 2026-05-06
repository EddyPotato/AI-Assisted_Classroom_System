import { useState } from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';

import SubjectsTab from '../subjects/SubjectsTab';
import CoursesTab from '../courses/CoursesTab';

export default function ResourceDirectoryTab() {
  const [activeSubTab, setActiveSubTab] = useState('subjects');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Sub-navigation Headers */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Resource Directory</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage academic subjects, credit units, and academic programs.</p>
        </div>
      </div>

      {/* Pill Toggle for Subjects vs Courses */}
      <div className="flex bg-slate-200/50 p-1.5 rounded-xl w-fit border border-slate-200/80 shadow-inner overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveSubTab('subjects')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
            activeSubTab === 'subjects'
              ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
          }`}
        >
          <BookOpen size={18} /> Academic Subjects
        </button>

        <button
          onClick={() => setActiveSubTab('courses')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
            activeSubTab === 'courses'
              ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
          }`}
        >
          <GraduationCap size={18} /> Academic Programs
        </button>
      </div>

      {/* Render the Active Sub-Tab */}
      <div className="mt-4">
        {activeSubTab === 'subjects' ? <SubjectsTab /> : <CoursesTab />}
      </div>

    </div>
  );
}