import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, Download, ArrowUpDown, ChevronUp, ChevronDown, CheckCircle2, Clock, AlertTriangle, XCircle, RefreshCw, User, AlertCircle } from 'lucide-react';

export default function ClassAttendance() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  
  const storedData = JSON.parse(sessionStorage.getItem('campus_user') || '{}');
  const userData = storedData.user || storedData; 
  
  const profId = userData.userId || userData.User_ID || userData.user_ID || userData.USER_ID || 'PRO-0001';

  // --- REAL STATE INSTEAD OF MOCK DATA ---
  const [mySchedules, setMySchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(scheduleId || '');
  
  const [roster, setRoster] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'lastName', direction: 'asc' });
  const [profPresence, setProfPresence] = useState('Checking...');

  // 1. Fetch Real Schedules for the Dropdown
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch(`http://localhost:5106/api/attendance/professor/${profId}/today`);
        if (res.ok) {
          const data = await res.json();
          setMySchedules(data);
          
          // Auto-select the first class if none is in the URL
          if (!scheduleId && data.length > 0) {
            setSelectedSchedule(data[0].schedule_ID);
          }
        }
      } catch (err) {
        console.error("Failed to fetch schedules:", err);
      }
    };
    fetchSchedules();
  }, [profId, scheduleId]);

  // 2. Fetch the Real Roster based on the selected dropdown
  useEffect(() => {
    if (!selectedSchedule) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const rosterRes = await fetch(`http://localhost:5106/api/attendance/schedule/${selectedSchedule}/roster`);
        if (rosterRes.ok) setRoster(await rosterRes.json());
        
        const profRes = await fetch(`http://localhost:5106/api/attendance/presence/user/${profId}`);
        if (profRes.ok) {
           const data = await profRes.json();
           setProfPresence(data.status);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [selectedSchedule, profId]);

  const getStudentData = (s) => {
    const id = s.student_ID || s.studentId || s.STUDENT_ID || 'UNKNOWN';
    const firstName = s.first_Name || s.firstName || s.FIRST_NAME || '';
    const middleName = s.middle_Name || s.middleName || s.MIDDLE_NAME || '';
    const lastName = s.last_Name || s.lastName || s.LAST_NAME || '';
    const rawFacePath = s.face_Reference_Path || s.faceReferencePath || s.FACE_REFERENCE_PATH;
    const computedFacePath = rawFacePath || `${lastName.toLowerCase().replace(/\s+/g, '')}_${id}_face.jpg`;

    return {
      id, firstName, middleName, lastName, facePath: computedFacePath,
      status: s.status || s.STATUS || 'Absent',
      arrivalTime: s.arrival_Time || s.arrivalTime || s.ARRIVAL_TIME || '--:--'
    };
  };

  const counts = {
    Present: roster.filter(s => getStudentData(s).status === 'Present').length,
    Late: roster.filter(s => getStudentData(s).status === 'Late').length,
    Absent: roster.filter(s => getStudentData(s).status === 'Absent').length,
    Cutting: roster.filter(s => getStudentData(s).status === 'Cutting').length,
  };

  const exportToCSV = () => { /* Export Logic */ };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredRoster = roster.filter(s => filter === 'All' || getStudentData(s).status === filter);
  const sortedRoster = [...filteredRoster].sort((a, b) => {
    const dataA = getStudentData(a);
    const dataB = getStudentData(b);
    const aValue = dataA[sortConfig.key] || '';
    const bValue = dataB[sortConfig.key] || '';
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-blue-500" />;
  };

  // Note: We removed the Header from this file since we are using the Global Header!
  return (
    <div className="h-screen w-full flex flex-col font-sans overflow-hidden bg-slate-50 text-slate-900">
      
      {/* We assume your App.jsx layout wraps this in the Global Header/Sidebar now */}
      
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto relative animate-in fade-in">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {!isLoading && profPresence.toLowerCase() !== 'in-class' && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl shadow-sm flex items-start gap-4">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={24} />
                <div>
                    <h3 className="text-amber-800 font-black text-lg">Action Required: Professor Not Checked In</h3>
                    <p className="text-amber-700 text-sm mt-1 font-medium">
                        Your system presence is currently <strong>'{profPresence}'</strong>. Please scan your ID or face at the edge node immediately.
                    </p>
                </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mt-2">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
                <ArrowLeft size={20} strokeWidth={2.5} />
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Class Attendance</h2>
                
                {/* DYNAMIC DROPDOWN using REAL Data */}
                <select 
                  value={selectedSchedule}
                  onChange={(e) => setSelectedSchedule(e.target.value)}
                  className="mt-1 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                >
                  {mySchedules.length === 0 && <option value="">No Classes Today</option>}
                  {mySchedules.map(sch => (
                    <option key={sch.schedule_ID} value={sch.schedule_ID}>
                      {sch.subject_Code} - {sch.section_Name} ({sch.time_Start})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button onClick={exportToCSV} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">
               <Download size={18} /> Export Report
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <button onClick={() => setFilter('Present')} className={`p-5 rounded-2xl border text-left transition-all ${filter === 'Present' ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg scale-105' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-2">
                 <span className={`text-xs font-black uppercase tracking-widest ${filter === 'Present' ? 'text-emerald-100' : 'text-emerald-600'}`}>Present</span>
                 <CheckCircle2 size={20} className={filter === 'Present' ? 'text-white' : 'text-emerald-400'} />
              </div>
              <div className={`text-4xl font-black ${filter === 'Present' ? 'text-white' : 'text-slate-800'}`}>{counts.Present}</div>
            </button>
            <button onClick={() => setFilter('Late')} className={`p-5 rounded-2xl border text-left transition-all ${filter === 'Late' ? 'bg-amber-500 border-amber-600 text-white shadow-lg scale-105' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-2">
                 <span className={`text-xs font-black uppercase tracking-widest ${filter === 'Late' ? 'text-amber-100' : 'text-amber-600'}`}>Late</span>
                 <Clock size={20} className={filter === 'Late' ? 'text-white' : 'text-amber-400'} />
              </div>
              <div className={`text-4xl font-black ${filter === 'Late' ? 'text-white' : 'text-slate-800'}`}>{counts.Late}</div>
            </button>
            <button onClick={() => setFilter('Absent')} className={`p-5 rounded-2xl border text-left transition-all ${filter === 'Absent' ? 'bg-slate-500 border-slate-600 text-white shadow-lg scale-105' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-2">
                 <span className={`text-xs font-black uppercase tracking-widest ${filter === 'Absent' ? 'text-slate-200' : 'text-slate-500'}`}>Absent</span>
                 <XCircle size={20} className={filter === 'Absent' ? 'text-white' : 'text-slate-400'} />
              </div>
              <div className={`text-4xl font-black ${filter === 'Absent' ? 'text-white' : 'text-slate-800'}`}>{counts.Absent}</div>
            </button>
            <button onClick={() => setFilter('Cutting')} className={`p-5 rounded-2xl border text-left transition-all ${filter === 'Cutting' ? 'bg-rose-500 border-rose-600 text-white shadow-lg scale-105' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-2">
                 <span className={`text-xs font-black uppercase tracking-widest ${filter === 'Cutting' ? 'text-rose-100' : 'text-rose-600'}`}>Cutting</span>
                 <AlertTriangle size={20} className={filter === 'Cutting' ? 'text-white' : 'text-rose-400'} />
              </div>
              <div className={`text-4xl font-black ${filter === 'Cutting' ? 'text-white' : 'text-slate-800'}`}>{counts.Cutting}</div>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-full whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b-2 border-slate-100">
                    <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('id')}><div className="flex items-center gap-1">ID {renderSortIcon('id')}</div></th>
                    <th className="p-4 w-24 text-center">Photo</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('lastName')}><div className="flex items-center gap-1">Full Name {renderSortIcon('lastName')}</div></th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 text-center" onClick={() => handleSort('status')}><div className="flex items-center justify-center gap-1">Status {renderSortIcon('status')}</div></th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 text-center" onClick={() => handleSort('arrivalTime')}><div className="flex items-center justify-center gap-1">Arrival Time {renderSortIcon('arrivalTime')}</div></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold">Loading records...</td></tr>
                  ) : sortedRoster.length === 0 ? (
                    <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold">No students found matching this filter.</td></tr>
                  ) : (
                    sortedRoster.map(s => {
                      const student = getStudentData(s);
                      return (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-600 text-sm">{student.id}</td>
                          <td className="p-3 flex justify-center">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                              <img src={`http://localhost:5106/ReferenceFaces/${student.facePath}`} className="absolute inset-0 w-full h-full object-cover z-10" onError={(e) => { e.target.style.display = 'none'; }} />
                            </div>
                          </td>
                          <td className="p-4 font-black text-slate-800 text-lg">{student.lastName}, {student.firstName} {student.middleName}</td>
                          <td className="p-4 text-center">
                            {student.status === 'Present' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 font-black text-xs uppercase tracking-widest rounded-lg">Present</span>}
                            {student.status === 'Late' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 font-black text-xs uppercase tracking-widest rounded-lg">Late</span>}
                            {student.status === 'Absent' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-lg">Absent</span>}
                            {student.status === 'Cutting' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 font-black text-xs uppercase tracking-widest rounded-lg animate-pulse">Cutting</span>}
                          </td>
                          <td className="p-4 text-center font-bold font-mono text-sm text-slate-600">{student.arrivalTime}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}