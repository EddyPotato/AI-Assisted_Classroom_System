import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, BookOpen, AlertCircle, Calendar } from 'lucide-react';

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('campus_user') || '{}');
  const [schedules, setSchedules] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const profId = user.user_ID || user.User_ID || 'PRO-0001';
        const res = await fetch(`http://localhost:5106/api/attendance/professor/${profId}/today`);
        if (res.ok) setSchedules(await res.json());
      } catch (err) {
        console.error("Failed to fetch schedules", err);
      }
    };
    fetchSchedules();
  }, [user.user_ID, user.User_ID]);

  // Helper to compare times
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

  // 3. Determine Status for the "Dial" layout
  const getScheduleStatus = (timeStartStr, timeEndStr) => {
    const start = parseTime(timeStartStr);
    const end = parseTime(timeEndStr);
    const now = currentTime;

    if (now > end) return 'past';
    if (now >= start && now <= end) return 'active';
    
    // Find the immediate next class
    const upcoming = schedules.filter(s => parseTime(s.time_Start) > now);
    if (upcoming.length > 0 && upcoming[0].time_Start === timeStartStr) return 'next';

    return 'future';
  };

  return (
    <main className="flex-1 p-8 overflow-y-auto bg-slate-50 flex flex-col items-center">
      
      {/* 1. Day & Time Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase flex items-center justify-center gap-3">
           <Calendar size={32} className="text-blue-500" />
           {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h2>
        <div className="text-5xl font-mono font-black text-blue-600 mt-4 tracking-tighter drop-shadow-sm">
          {currentTime.toLocaleTimeString('en-US', { hour12: true })}
        </div>
      </div>

      {/* 2. The Dial Layout */}
      <div className="w-full max-w-2xl space-y-4 relative">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200 -z-10 shadow-sm"></div>

        {schedules.map((sched) => {
          const status = getScheduleStatus(sched.time_Start, sched.time_End);
          
          let cardClasses = "transition-all duration-500 cursor-pointer border rounded-3xl p-6 flex items-center justify-between shadow-sm relative overflow-hidden backdrop-blur-md";
          
          if (status === 'active' || status === 'next') {
             // Center Focus: Green, scaled up
             cardClasses += " bg-emerald-500 text-white border-emerald-400 scale-105 shadow-xl shadow-emerald-500/20 z-10";
          } else if (status === 'past') {
             // Past: Orange, warning vibe, faded
             cardClasses += " bg-amber-50/80 border-amber-200 text-slate-600 opacity-70 hover:opacity-100";
          } else {
             // Future: Gray, out of focus
             cardClasses += " bg-white/80 border-slate-200 text-slate-500 opacity-60 hover:opacity-100 scale-95";
          }

          return (
            <div key={sched.schedule_ID} className={cardClasses} onClick={() => navigate(`/class/${sched.schedule_ID}`)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-black px-3 py-1 rounded-full tracking-widest uppercase ${status === 'active' || status === 'next' ? 'bg-emerald-400/30 text-emerald-50' : 'bg-slate-200 text-slate-500'}`}>
                    {sched.subject_Code}
                  </span>
                  {status === 'past' && <span className="text-amber-500 flex items-center gap-1 text-xs font-black"><AlertCircle size={14}/> CONCLUDED</span>}
                  {status === 'active' && <span className="text-white flex items-center gap-1 text-xs font-black"><span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> IN SESSION</span>}
                </div>
                <h3 className={`text-2xl font-black truncate tracking-tight ${status === 'active' || status === 'next' ? 'text-white' : 'text-slate-800'}`}>
                  {sched.subject_Title}
                </h3>
              </div>

              <div className={`flex flex-col items-end shrink-0 gap-1 text-right ml-4 ${status === 'active' || status === 'next' ? 'text-emerald-50' : 'text-slate-500'}`}>
                <div className="flex items-center gap-2 font-bold text-lg font-mono">
                  <Clock size={18} /> {sched.time_Start}
                </div>
                <div className="flex items-center gap-2 font-bold text-sm">
                  <MapPin size={16} /> {sched.room_ID}
                </div>
              </div>
            </div>
          );
        })}

        {schedules.length === 0 && (
           <div className="text-center p-12 text-slate-400 font-bold bg-white rounded-3xl border border-slate-200">
             No schedules assigned for today.
           </div>
        )}
      </div>

    </main>
  );
}