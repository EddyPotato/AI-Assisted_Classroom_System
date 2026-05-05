import { useState } from 'react';
import { Search, Plus, Users, LibrarySquare } from 'lucide-react';
import SectionRoster from './SectionRoster';

export default function SectionsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState(null);

  // MOCK DATA: Updated to include Professor Names and Student Counts
  const [sections] = useState([
    { section_ID: 'SEC-001', section_Name: 'SBIT-1A', program: 'IT', year_Level: 1, professor_Name: 'Dr. Maria Santos', student_Count: 35 },
    { section_ID: 'SEC-002', section_Name: 'SBIT-2A', program: 'IT', year_Level: 2, professor_Name: 'Engr. John Doe', student_Count: 42 },
    { section_ID: 'SEC-003', section_Name: 'SBCS-3B', program: 'CS', year_Level: 3, professor_Name: 'Prof. Alan Turing', student_Count: 28 },
  ]);

  // Helper to expand acronyms
  const getFullProgramName = (code) => {
    const dict = {
      'IT': 'Bachelor of Science in Information Technology',
      'BSIT': 'Bachelor of Science in Information Technology',
      'CS': 'Bachelor of Science in Computer Science',
      'BSCS': 'Bachelor of Science in Computer Science'
    };
    return dict[code?.toUpperCase()] || code;
  };

  const filteredSections = sections.filter(section =>
    section.section_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedSection) {
    return <SectionRoster section={selectedSection} onBack={() => setSelectedSection(null)} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Academic Sections</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage cohorts, assign advisers, and handle student rosters.</p>
        </div>
      </div>

      <div className="p-5 border border-slate-200 bg-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by Section Name or Program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95">
          <Plus size={18} /> Create Section
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSections.map((section) => (
          <div 
            key={section.section_ID} 
            onClick={() => setSelectedSection(section)}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-black text-xl tracking-tight border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {section.section_Name}
              </div>
              
              {/* NEW: Student Count Badge */}
              <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg font-bold text-sm border border-slate-200">
                <Users size={16} className="text-slate-400" />
                {section.student_Count || 0} Students
              </div>
            </div>
            
            <div className="space-y-4 flex-1">
              {/* NEW: Full Program Name & Year */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><LibrarySquare size={14}/> Program & Level</p>
                <p className="font-bold text-slate-700 leading-tight">{getFullProgramName(section.program)}</p>
                <p className="text-sm font-bold text-blue-600 mt-0.5">Year {section.year_Level}</p>
              </div>

              {/* NEW: Professor Name display */}
              <div className="pt-4 border-t border-slate-100 mt-auto">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Adviser</p>
                 <p className="font-black text-slate-800">{section.professor_Name || 'Unassigned'}</p>
              </div>
            </div>
          </div>
        ))}

        {filteredSections.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <p className="text-slate-500 font-bold">No sections found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}