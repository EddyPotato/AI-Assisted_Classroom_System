import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, AlertCircle, Calendar, LogOut, User } from 'lucide-react';

// Import the system logo from your assets folder
import qcuLogo from '../../assets/qcu-logo.svg';

export default function FacultyDashboard() {
  const navigate = useNavigate();
  
  // 1. Get raw string from session storage
  const rawSession = sessionStorage.getItem('campus_user');
  
  // 2. Safely parse. If null, use empty object to prevent crashes
  const storedData = rawSession ? JSON.parse(rawSession) : {};
  
  // 3. Handle backend wrapping (sometimes { message: "...", user: {...} })
  const userData = storedData.user || storedData; 

  const [schedules, setSchedules] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Image load state to prevent DOM jitter
  const [imgError, setImgError] = useState(false);

  // --- THE FIX: ASP.NET Core Default CamelCasing Extraction ---
  // C# Property `First_Name` -> JSON `first_Name`
  // C# Property `User_ID`    -> JSON `user_ID`
  const firstName = userData.first_Name || userData.First_Name || userData.first_name || userData.FIRST_NAME || 'Unknown';
  const lastName = userData.last_Name || userData.Last_Name || userData.last_name || userData.LAST_NAME || '';
  const userId = userData.user_ID || userData.User_ID || userData.userId || userData.USER_ID || 'PRO-0001';
  
  // Grab the exact filename saved in the DB (FACE_REFERENCE_PATH -> face_Reference_Path)
  const dbFacePath = userData.face_Reference_Path || userData.Face_Reference_Path || userData.faceReferencePath || userData.FACE_REFERENCE_PATH;
  
  // Safely construct the final image URL
  const profPicUrl = dbFacePath 
      ? `http://localhost:5106/ReferenceFaces/${dbFacePath}`
      : `http://localhost:5106/ReferenceFaces/${lastName.toLowerCase()}_${userId}_staff_face.jpg`;

  // 1. Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch(`http://localhost:5106/api/attendance/professor/${userId}/today`);
        if (res.ok) setSchedules(await res.json());
      } catch (err) {
        console.error("Failed to fetch schedules", err);
      }
    };
    fetchSchedules();
  }, [userId]);

  // Helper to accurately parse time (e.g., "08:00 AM" or "12:30 PM") into Date objects for sorting
  const parseTime = (timeStr) => {
    if (!timeStr) return new Date();
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    
    if (hours === 12 && modifier === 'AM') hours = 0;
    if (modifier === 'PM' && hours < 12) hours += 12;
    
    const d = new Date();
    d.setHours(hours, parseInt(minutes, 10), 0, 0);
    return d;
  };

  // 3. SORT SCHEDULES CHRONOLOGICALLY (Earliest to Latest)
  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) => parseTime(a.time_Start) - parseTime(b.time_Start));
  }, [schedules]);

  // 4. Determine Status for the visual layout
  const getScheduleStatus = (sched, sortedList) => {
    const start = parseTime(sched.time_Start);
    const end = parseTime(sched.time_End);
    const now = currentTime;

    // Concluded session
    if (now > end) return 'past';
    
    // Currently ongoing session
    if (now >= start && now <= end) return 'active';
    
    // Find the immediate next class from the sorted list
    const upcoming = sortedList.filter(s => parseTime(s.time_Start) > now);
    if (upcoming.length > 0 && upcoming[0].schedule_ID === sched.schedule_ID) {
      return 'next';
    }

    // Unconcluded sessions that are NOT the immediate next one
    return 'future';
  };

  const handleLogout = () => {
    sessionStorage.removeItem('campus_user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen w-full flex flex-col font-sans overflow-hidden bg-slate-50 text-slate-900">
      
      {/* HEADER: Logo on Left | Profile + Logout on Right */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0 z-20 relative">
        
        {/* LEFT SIDE: System Logo */}
        <div className="flex items-center gap-3">
          <img src={qcuLogo} alt="System Logo" className="h-10 w-auto" />
          <h1 className="text-xl font-black text-slate-800 leading-tight tracking-tight hidden sm:block">Faculty Portal</h1>
        </div>

        {/* RIGHT SIDE: User Info & Logout Button */}
        <div className="flex items-center gap-5 sm:gap-8">
          
          {/* User Profile Block */}
          <div className="flex items-center gap-3 text-right">
            <div className="hidden sm:block">
              <p className="text-sm font-black text-slate-800 leading-tight tracking-tight">
                Prof. {firstName} {lastName}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {userId}
              </p>
            </div>
            
            {/* Anti-Jitter Image Container. 
                The fallback icon is permanently rendered behind the image layer. 
                If the image fails, the top layer simply disappears. */}
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
          
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div> {/* Divider */}

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold hover:bg-rose-100 hover:text-rose-700 transition-colors shadow-sm"
          >
            <LogOut size={18} strokeWidth={2.5} /> <span className="hidden sm:inline">Logout</span>
          </button>

        </div>
      </header>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto flex flex-col items-center relative z-10">
        
        {/* Day & Time Display */}
        <div className="text-center mb-10 mt-4">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight uppercase flex items-center justify-center gap-3">
             <Calendar size={32} className="text-blue-500" />
             {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          <div className="text-5xl sm:text-6xl font-mono font-black text-blue-600 mt-2 tracking-tighter drop-shadow-sm">
            {currentTime.toLocaleTimeString('en-US', { hour12: true })}
          </div>
        </div>

        {/* Chronological Dial Layout */}
        <div className="w-full max-w-2xl space-y-4 relative">
          {/* Vertical connecting line to simulate a timeline */}
          <div className="absolute top-0 bottom-0 left-8 sm:left-12 w-1 bg-slate-200 -z-10 rounded-full"></div>

          {sortedSchedules.map((sched) => {
            const status = getScheduleStatus(sched, sortedSchedules);
            
            let cardClasses = "transition-all duration-500 cursor-pointer border rounded-3xl p-5 sm:p-6 flex items-center justify-between shadow-sm relative overflow-hidden backdrop-blur-md ml-4 sm:ml-0";
            
            // ONLY Active and Next are highlighted green
            if (status === 'active' || status === 'next') {
               cardClasses += " bg-emerald-500 text-white border-emerald-400 scale-105 shadow-xl shadow-emerald-500/20 z-10";
            } else {
               // Past and Future (after next) are grayed out
               cardClasses += " bg-white/60 border-slate-200 text-slate-400 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:scale-100 scale-95 origin-left sm:origin-center";
            }

            return (
              <div key={sched.schedule_ID} className={cardClasses} onClick={() => navigate(`/class/${sched.schedule_ID}`)}>
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs font-black px-3 py-1 rounded-full tracking-widest uppercase ${status === 'active' || status === 'next' ? 'bg-emerald-400/30 text-emerald-50' : 'bg-slate-200 text-slate-500'}`}>
                      {sched.subject_Code}
                    </span>
                    {status === 'past' && <span className="text-slate-400 flex items-center gap-1 text-xs font-black"><AlertCircle size={14}/> CONCLUDED</span>}
                    {status === 'future' && <span className="text-slate-400 flex items-center gap-1 text-xs font-black">UPCOMING</span>}
                    {status === 'active' && <span className="text-white flex items-center gap-1 text-xs font-black"><span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> IN SESSION</span>}
                  </div>
                  <h3 className={`text-xl sm:text-2xl font-black truncate tracking-tight ${status === 'active' || status === 'next' ? 'text-white' : 'text-slate-500'}`}>
                    {sched.subject_Title}
                  </h3>
                </div>

                <div className={`flex flex-col items-end shrink-0 gap-1 text-right border-l pl-4 ${status === 'active' || status === 'next' ? 'border-emerald-400/50 text-emerald-50' : 'border-slate-200 text-slate-400'}`}>
                  <div className="flex items-center gap-1.5 font-black text-sm sm:text-lg font-mono">
                    <Clock size={18} /> {sched.time_Start} - {sched.time_End}
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                    <MapPin size={16} /> {sched.room_ID}
                  </div>
                </div>
              </div>
            );
          })}

          {sortedSchedules.length === 0 && (
             <div className="text-center p-12 text-slate-400 font-bold bg-white rounded-3xl border border-slate-200 shadow-sm mt-8">
               No schedules assigned for today.
             </div>
          )}
        </div>

      </main>
    </div>
  );
}