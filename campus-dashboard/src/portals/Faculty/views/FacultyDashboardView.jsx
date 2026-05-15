import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, AlertCircle, Calendar } from 'lucide-react';

export default function FacultyDashboardView() {
  const navigate = useNavigate();
  
  const rawSession = sessionStorage.getItem('campus_user');
  const storedData = rawSession ? JSON.parse(rawSession) : {};
  const userData = storedData.user || storedData; 

  const [schedules, setSchedules] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const userId = userData.user_ID || userData.User_ID || userData.userId || userData.USER_ID || 'PRO-0001';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) => parseTime(a.time_Start) - parseTime(b.time_Start));
  }, [schedules]);

  const getScheduleStatus = (sched, sortedList) => {
    const start = parseTime(sched.time_Start);
    const end = parseTime(sched.time_End);
    const now = currentTime;

    if (now > end) return 'past';
    if (now >= start && now <= end) return 'active';
    
    const upcoming = sortedList.filter(s => parseTime(s.time_Start) > now);
    if (upcoming.length > 0 && upcoming[0].schedule_ID === sched.schedule_ID) {
      return 'next';
    }
    return 'future';
  };

  return (
    <main className="h-full w-full p-4 sm:p-8 overflow-y-auto flex flex-col items-center relative z-10 animate-in fade-in">
      
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
        <div className="absolute top-0 bottom-0 left-8 sm:left-12 w-1 bg-slate-200 -z-10 rounded-full"></div>

        {sortedSchedules.map((sched) => {
          const status = getScheduleStatus(sched, sortedSchedules);
          
          let cardClasses = "transition-all duration-500 cursor-pointer border rounded-3xl p-5 sm:p-6 flex items-center justify-between shadow-sm relative overflow-hidden backdrop-blur-md ml-4 sm:ml-0";
          
          if (status === 'active' || status === 'next') {
              cardClasses += " bg-emerald-500 text-white border-emerald-400 scale-105 shadow-xl shadow-emerald-500/20 z-10";
          } else {
              cardClasses += " bg-white/60 border-slate-200 text-slate-400 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:scale-100 scale-95 origin-left sm:origin-center";
          }

          return (
            <div key={sched.schedule_ID} className={cardClasses} onClick={() => navigate(`/faculty/attendance/${sched.schedule_ID}`)}>
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
  );
}