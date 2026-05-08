import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, Download, ArrowUpDown, ChevronUp, ChevronDown, CheckCircle2, Clock, AlertTriangle, XCircle, RefreshCw, LogOut, User } from 'lucide-react';

// Import the system logo from your assets folder
import qcuLogo from '../../assets/qcu-logo.svg';

export default function ClassAttendance() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  
  // --- USER AUTHENTICATION & HEADER DATA ---
  const storedData = JSON.parse(sessionStorage.getItem('campus_user') || '{}');
  const userData = storedData.user || storedData; 
  
  const [imgError, setImgError] = useState(false);
  
  const profFirstName = userData.firstName || userData.First_Name || userData.first_name || userData.FIRST_NAME || 'Unknown';
  const profLastName = userData.lastName || userData.Last_Name || userData.last_name || userData.LAST_NAME || '';
  const profId = userData.userId || userData.User_ID || userData.user_ID || userData.USER_ID || 'PRO-0001';
  const profDbFacePath = userData.faceReferencePath || userData.Face_Reference_Path || userData.face_Reference_Path || userData.FACE_REFERENCE_PATH;
  
  const profPicUrl = profDbFacePath 
      ? `http://localhost:5106/ReferenceFaces/${profDbFacePath}`
      : `http://localhost:5106/ReferenceFaces/${profLastName.toLowerCase()}_${profId}_staff_face.jpg`;

  const handleLogout = () => {
    sessionStorage.removeItem('campus_user');
    navigate('/login', { replace: true });
  };

  // --- ATTENDANCE STATE ---
  const [roster, setRoster] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'lastName', direction: 'asc' });

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

  // THE FIX: Safe extraction & Dynamic Face URL Construction
  const getStudentData = (s) => {
    const id = s.studentId || s.student_ID || s.STUDENT_ID || 'UNKNOWN';
    const firstName = s.firstName || s.first_Name || s.FIRST_NAME || '';
    const middleName = s.middleName || s.middle_Name || s.MIDDLE_NAME || '';
    const lastName = s.lastName || s.last_Name || s.LAST_NAME || '';
    
    // Attempt to grab from the DB column first
    const rawFacePath = s.faceReferencePath || s.face_Reference_Path || s.FACE_REFERENCE_PATH;
    
    // If null/missing, dynamically construct exactly as requested: lastname_studentID_face.jpg
    const safeLastName = lastName.toLowerCase().replace(/\s+/g, ''); // Strip spaces just in case
    const computedFacePath = rawFacePath || `${safeLastName}_${id}_face.jpg`;

    return {
      id, 
      firstName, 
      middleName, 
      lastName,
      facePath: computedFacePath,
      status: s.status || s.STATUS || 'Absent',
      arrivalTime: s.arrivalTime || s.arrival_Time || s.ARRIVAL_TIME || '--:--'
    };
  };

  // 1. Calculations for the Top Counters
  const counts = {
    Present: roster.filter(s => getStudentData(s).status === 'Present').length,
    Late: roster.filter(s => getStudentData(s).status === 'Late').length,
    Absent: roster.filter(s => getStudentData(s).status === 'Absent').length,
    Cutting: roster.filter(s => getStudentData(s).status === 'Cutting').length,
  };

  // 2. Export to CSV Logic
  const exportToCSV = () => {
    const headers = ['Student ID', 'Last Name', 'First Name', 'Middle Name', 'Status', 'Arrival Time'];
    const rows = roster.map(s => {
      const data = getStudentData(s);
      return [data.id, data.lastName, data.firstName, data.middleName, data.status, data.arrivalTime];
    });
    
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

  const filteredRoster = roster.filter(s => filter === 'All' || getStudentData(s).status === filter);
  
  const sortedRoster = [...filteredRoster].sort((a, b) => {
    const dataA = getStudentData(a);
    const dataB = getStudentData(b);

    if (sortConfig.key === 'arrivalTime') {
      const parseTime = (timeStr) => {
        if (!timeStr || timeStr === '--:--') return 9999;
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (hours === 12) hours = 0;
        if (modifier === 'PM') hours += 12;
        return hours * 60 + minutes;
      };
      const timeA = parseTime(dataA.arrivalTime);
      const timeB = parseTime(dataB.arrivalTime);
      if (timeA < timeB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (timeA > timeB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    }

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

  return (
    <div className="h-screen w-full flex flex-col font-sans overflow-hidden bg-slate-50 text-slate-900">
      
      {/* HEADER: Permanent Top Navigation */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0 z-20 relative">
        <div className="flex items-center gap-3">
          <img src={qcuLogo} alt="System Logo" className="h-10 w-auto" />
          <h1 className="text-xl font-black text-slate-800 leading-tight tracking-tight hidden sm:block">Faculty Portal</h1>
        </div>

        <div className="flex items-center gap-5 sm:gap-8">
          <div className="flex items-center gap-3 text-right">
            <div className="hidden sm:block">
              <p className="text-sm font-black text-slate-800 leading-tight tracking-tight">
                Prof. {profFirstName} {profLastName}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {profId}
              </p>
            </div>
            
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-100 shrink-0">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100">
                <User size={24} />
              </div>
              {!imgError && (
                <img 
                  src={profPicUrl} 
                  alt="Professor Profile" 
                  className="absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300"
                  onError={() => setImgError(true)}
                />
              )}
            </div>
          </div>
          
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold hover:bg-rose-100 hover:text-rose-700 transition-colors shadow-sm"
          >
            <LogOut size={18} strokeWidth={2.5} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto relative animate-in fade-in">
        
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Controls Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mt-2">
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

          {/* 3 Status Counters */}
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

          {filter !== 'All' && (
            <div className="flex justify-end">
              <button onClick={() => setFilter('All')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-xl">
                <RefreshCw size={14} /> Clear Filter
              </button>
            </div>
          )}

          {/* Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-full whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b-2 border-slate-100 select-none">
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors w-32" onClick={() => handleSort('id')}>
                      <div className="flex items-center gap-1">ID {renderSortIcon('id')}</div>
                    </th>
                    <th className="p-4 w-24 text-center">Photo</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('lastName')}>
                      <div className="flex items-center gap-1">Full Name {renderSortIcon('lastName')}</div>
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors text-center w-40" onClick={() => handleSort('status')}>
                      <div className="flex items-center justify-center gap-1">Status {renderSortIcon('status')}</div>
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors text-center w-40" onClick={() => handleSort('arrivalTime')}>
                      <div className="flex items-center justify-center gap-1">Arrival Time {renderSortIcon('arrivalTime')}</div>
                    </th>
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
                          {/* 1. Student ID */}
                          <td className="p-4 font-mono font-bold text-slate-600 text-sm">
                            {student.id}
                          </td>

                          {/* 2. Photo (Anti-Jitter Implementation) */}
                          <td className="p-3 flex justify-center">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm bg-slate-100 shrink-0">
                              <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100">
                                <UserCircle size={20} />
                              </div>
                              <img 
                                src={`http://localhost:5106/ReferenceFaces/${student.facePath}`} 
                                alt={`${student.firstName} Face`}
                                className="absolute inset-0 w-full h-full object-cover z-10 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(`http://localhost:5106/ReferenceFaces/${student.facePath}`, '_blank')}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>
                          </td>

                          {/* 3. Full Name (Last, First Middle) */}
                          <td className="p-4">
                            <div className="font-black text-slate-800 text-lg leading-tight">
                              {student.lastName}, {student.firstName} {student.middleName}
                            </div>
                          </td>

                          {/* 4. Status */}
                          <td className="p-4 text-center">
                            {student.status === 'Present' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 font-black text-xs uppercase tracking-widest rounded-lg shadow-sm"><CheckCircle2 size={14}/> Present</span>}
                            {student.status === 'Late' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 font-black text-xs uppercase tracking-widest rounded-lg shadow-sm"><Clock size={14}/> Late</span>}
                            {student.status === 'Absent' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200 font-black text-xs uppercase tracking-widest rounded-lg shadow-sm"><XCircle size={14}/> Absent</span>}
                            {student.status === 'Cutting' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs uppercase tracking-widest rounded-lg shadow-sm animate-pulse"><AlertTriangle size={14}/> Cutting</span>}
                          </td>

                          {/* 5. Arrival Time */}
                          <td className="p-4 text-center font-bold font-mono text-sm text-slate-600">
                            {student.arrivalTime}
                          </td>
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