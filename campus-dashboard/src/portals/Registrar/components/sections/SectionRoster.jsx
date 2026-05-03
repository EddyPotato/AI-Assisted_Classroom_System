import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Search, GraduationCap } from 'lucide-react';

export default function SectionRoster({ section, onBack }) {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // We will build this exact endpoint in our C# backend next!
    // It will query the ENROLLMENTS table to find all students in this specific section.
    const fetchRoster = async () => {
      try {
        const response = await fetch(`http://localhost:5106/api/sections/${section.section_ID}/students`);
        if (response.ok) {
          setStudents(await response.json());
        }
      } catch (err) {
        console.error("Failed to fetch section roster", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoster();
  }, [section.section_ID]);

  const filteredStudents = students.filter(s => 
    s.student_ID.includes(searchQuery) || 
    `${s.first_Name} ${s.last_Name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in slide-in-from-right-8 duration-300">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-all shadow-sm"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{section.section_Name}</h2>
            <p className="text-sm font-bold text-slate-500">{section.course} - Year {section.year_Level}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
          <Users className="text-blue-500" size={20} />
          <span className="font-black text-blue-700 text-lg">{students.length} <span className="text-sm font-bold text-blue-500">Enrolled</span></span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search roster..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" 
            />
          </div>
        </div>

        {/* Roster Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b border-slate-200">
              <th className="p-4">Student ID</th>
              <th className="p-4">Full Name</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan="3" className="p-8 text-center text-slate-400 font-bold">Loading roster...</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan="3" className="p-8 text-center text-slate-400 font-bold">No students found in this section.</td></tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.student_ID} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-600 font-mono text-sm">{student.student_ID}</td>
                  <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                      <GraduationCap size={16} />
                    </div>
                    {student.last_Name}, {student.first_Name}
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg text-xs font-bold">
                      {student.enrollment_Status || 'Regular'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}