import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, Download, ArrowUpDown, ChevronUp, ChevronDown, CheckCircle2, Clock, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

export default function ClassAttendance() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  
  const [roster, setRoster] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'last_Name', direction: 'asc' });

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        const res = await fetch(`http://localhost:5106/api/attendance/schedule/${scheduleId}/roster`);
        if (res.ok) setRoster(await res.json());
      } catch (err) {
        console.error("Failed to fetch roster:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoster();
  }, [scheduleId]);

  // 1. Calculations for the Top Counters
  const counts = {
    Present: roster.filter(s => s.status === 'Present').length,
    Late: roster.filter(s => s.status === 'Late').length,
    Absent: roster.filter(s => s.status === 'Absent').length,
    Cutting: roster.filter(s => s.status === 'Cutting').length,
  };

  // 2. Export to CSV Logic
  const exportToCSV = () => {
    const headers = ['Student ID', 'Last Name', 'First Name', 'Status', 'Arrival Time'];
    const rows = roster.map(s => [
      s.student_ID, s.last_Name, s.first_Name, s.status, s.arrival_Time
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Report_${scheduleId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Sorting & Filtering
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredRoster = roster.filter(s => filter === 'All' || s.status === filter);
  
  const sortedRoster = [...filteredRoster].sort((a, b) => {
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-blue-500" />;
  };

  return (
    <main className="flex-1 p-8 overflow-y-auto bg-slate-50 relative animate-in fade-in">
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Class Attendance</h2>
              <p className="text-sm font-bold text-slate-500">{scheduleId} — Real-time Roster</p>
            </div>
          </div>
          <button onClick={exportToCSV} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">
             <Download size={18} /> Export Report
          </button>
        </div>

        {/* 3 Status Counters (Clickable Filters) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => setFilter('Present')} className={`p-5 rounded-2xl border text-left transition-all group ${filter === 'Present' ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg scale-105' : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm'}`}>
            <div className="flex justify-between items-center mb-2">
               <span className={`text-xs font-black uppercase tracking-widest ${filter === 'Present' ? 'text-emerald-100' : 'text-emerald-600'}`}>Present</span>
               <CheckCircle2 size={20} className={filter === 'Present' ? 'text-white' : 'text-emerald-400'} />
            </div>
            <div className={`text-4xl font-black ${filter === 'Present' ? 'text-white' : 'text-slate-800'}`}>{counts.Present}</div>
          </button>
          
          <button onClick={() => setFilter('Late')} className={`p-5 rounded-2xl border text-left transition-all group ${filter === 'Late' ? 'bg-amber-500 border-amber-600 text-white shadow-lg scale-105' : 'bg-white border-slate-200 hover:border-amber-300 shadow-sm'}`}>
            <div className="flex justify-between items-center mb-2">
               <span className={`text-xs font-black uppercase tracking-widest ${filter === 'Late' ? 'text-amber-100' : 'text-amber-600'}`}>Late</span>
               <Clock size={20} className={filter === 'Late' ? 'text-white' : 'text-amber-400'} />
            </div>
            <div className={`text-4xl font-black ${filter === 'Late' ? 'text-white' : 'text-slate-800'}`}>{counts.Late}</div>
          </button>

          <button onClick={() => setFilter('Absent')} className={`p-5 rounded-2xl border text-left transition-all group ${filter === 'Absent' ? 'bg-rose-500 border-rose-600 text-white shadow-lg scale-105' : 'bg-white border-slate-200 hover:border-rose-300 shadow-sm'}`}>
            <div className="flex justify-between items-center mb-2">
               <span className={`text-xs font-black uppercase tracking-widest ${filter === 'Absent' ? 'text-rose-100' : 'text-rose-600'}`}>Absent</span>
               <XCircle size={20} className={filter === 'Absent' ? 'text-white' : 'text-rose-400'} />
            </div>
            <div className={`text-4xl font-black ${filter === 'Absent' ? 'text-white' : 'text-slate-800'}`}>{counts.Absent}</div>
          </button>
        </div>

        {/* Reset Filter Button */}
        {filter !== 'All' && (
          <div className="flex justify-end">
            <button onClick={() => setFilter('All')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 px-4 py-2 rounded-lg">
              <RefreshCw size={14} /> Clear Filter
            </button>
          </div>
        )}

        {/* Roster Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse min-w-full">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b-2 border-slate-100 select-none">
                <th className="p-4 w-24 text-center">Photo</th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('last_Name')}>
                  <div className="flex items-center gap-1">Full Name {renderSortIcon('last_Name')}</div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors text-center w-40" onClick={() => handleSort('status')}>
                  <div className="flex items-center justify-center gap-1">Status {renderSortIcon('status')}</div>
                </th>
                <th className="p-4 w-40 text-center">Arrival Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan="4" className="p-12 text-center text-slate-400 font-bold">Loading records...</td></tr>
              ) : sortedRoster.length === 0 ? (
                <tr><td colSpan="4" className="p-12 text-center text-slate-400 font-bold">No students found matching this filter.</td></tr>
              ) : (
                sortedRoster.map(student => (
                  <tr key={student.student_ID} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 flex justify-center">
                      {student.face_Reference_Path ? (
                         <img 
                           src={`http://localhost:5106/ReferenceFaces/${student.face_Reference_Path}`} 
                           alt="Face" 
                           className="w-10 h-10 object-cover aspect-square rounded-full border border-slate-200 shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                           onClick={() => window.open(`http://localhost:5106/ReferenceFaces/${student.face_Reference_Path}`, '_blank')}
                         />
                      ) : (
                         <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200"><UserCircle size={20}/></div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-black text-slate-800 text-lg leading-tight">
                        {student.last_Name}, {student.first_Name} {student.middle_Name}
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-400">{student.student_ID}</div>
                    </td>
                    <td className="p-4 text-center">
                      {student.status === 'Present' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 font-black text-xs uppercase tracking-widest rounded-lg shadow-sm"><CheckCircle2 size={14}/> Present</span>}
                      {student.status === 'Late' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 font-black text-xs uppercase tracking-widest rounded-lg shadow-sm"><Clock size={14}/> Late</span>}
                      {student.status === 'Absent' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200 font-black text-xs uppercase tracking-widest rounded-lg shadow-sm"><XCircle size={14}/> Absent</span>}
                      {student.status === 'Cutting' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs uppercase tracking-widest rounded-lg shadow-sm animate-pulse"><AlertTriangle size={14}/> Cutting</span>}
                    </td>
                    <td className="p-4 text-center font-bold font-mono text-sm text-slate-600">
                      {student.arrival_Time}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}