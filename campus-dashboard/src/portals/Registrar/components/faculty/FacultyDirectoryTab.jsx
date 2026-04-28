import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, Camera, ArrowUpDown, ChevronUp, ChevronDown, Edit2 } from 'lucide-react';

export default function FacultyDirectoryTab() {
  const [professors, setProfessors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'professor_ID', direction: 'asc' });

  // FETCH LOGIC (Will point to our new C# API next!)
  const fetchProfessors = useCallback(() => {
    let isMounted = true;
    fetch('http://localhost:5106/api/professor')
      .then(res => res.json())
      .then(data => { if (isMounted && Array.isArray(data)) setProfessors(data); })
      .catch(err => console.error("Failed to fetch professors", err));
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const cleanup = fetchProfessors();
    return cleanup;
  }, [fetchProfessors]);

  // Filtering Logic
  const filteredProfessors = professors.filter(prof => {
    const fullName = `${prof.first_Name} ${prof.last_Name}`.toLowerCase();
    const matchesSearch = prof.professor_ID.includes(searchQuery) || fullName.includes(searchQuery.toLowerCase());
    const matchesFilter = filterDepartment === 'All' || prof.department === filterDepartment;
    return matchesSearch && matchesFilter;
  });

  // Sorting Logic
  const sortedProfessors = [...filteredProfessors].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-primary-500" /> : <ChevronDown size={14} className="text-primary-500" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Faculty Directory</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm">Manage professor profiles, departments, and face data for attendance.</p>
        </div>
        <button 
          onClick={() => alert('Add Professor Modal coming next!')} 
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
        >
          <UserPlus size={18} /> Register Professor
        </button>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search ID or Name..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg outline-none text-slate-700 font-bold bg-white">
            <option value="All">All Departments</option>
            <option value="BSIT">BSIT</option>
            <option value="BSEMC">BSEMC</option>
            <option value="BSCS">BSCS</option>
          </select>
        </div>
        
        <table className="w-full text-left table-fixed border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b-2 border-slate-200 cursor-pointer select-none">
              <th className="p-4 w-32 hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('professor_ID')}>
                <div className="flex items-center gap-1">Emp ID {renderSortIcon('professor_ID')}</div>
              </th>
              <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('first_Name')}>
                <div className="flex items-center gap-1">First Name {renderSortIcon('first_Name')}</div>
              </th>
              <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('last_Name')}>
                <div className="flex items-center gap-1">Last Name {renderSortIcon('last_Name')}</div>
              </th>
              <th className="p-4 w-40 hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('department')}>
                 <div className="flex items-center gap-1">Department {renderSortIcon('department')}</div>
              </th>
              <th className="p-4 w-28 text-center cursor-default outline-none">Face</th>
              <th className="p-4 w-24 text-center cursor-default outline-none">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {sortedProfessors.map((prof) => (
              <tr key={prof.professor_ID} className="hover:bg-primary-50/40 transition-colors group">
                <td className="p-4 font-bold text-slate-600 font-mono text-sm">{prof.professor_ID}</td>
                <td className="p-4 font-bold text-slate-800 truncate">{prof.first_Name}</td>
                <td className="p-4 font-bold text-slate-800 truncate">{prof.last_Name}</td>
                <td className="p-4">
                  <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold border bg-indigo-50 text-indigo-700 border-indigo-200">
                    {prof.department}
                  </span>
                </td>
                <td className="p-4 flex justify-center items-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border-2 border-slate-200">
                    <Camera size={16}/>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Professor">
                    <Edit2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {sortedProfessors.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-bold bg-slate-50/50">No matching faculty found. Click "Register Professor" to add one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}