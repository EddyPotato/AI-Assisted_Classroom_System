import { useState, useEffect } from 'react';
import { Search, MapPin, UserCircle, CalendarDays, Clock, X, ChevronDown } from 'lucide-react';
import MasterScheduleTable from './MasterScheduleTable';
import FaceZoomModal from '../users/FaceZoomModal';

export default function SchedulesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [profFilter, setProfFilter] = useState('');
  const [dayFilter, setDayFilter] = useState(''); // NEW: Day filter state
  
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSchedules = async () => {
      try {
        const res = await fetch('http://localhost:5106/api/schedules');
        const data = await res.json();
        if (isMounted && Array.isArray(data)) setSchedules(data); 
      } catch (err) {
        console.error("Failed to fetch global schedules:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchSchedules();
    
    return () => { isMounted = false; };
  }, []);

  const uniqueRooms = [...new Set(schedules.map(s => s.room_ID).filter(Boolean))].sort();
  const uniqueProfs = [...new Set(schedules.map(s => s.professor_Name || s.professor_ID).filter(Boolean))].sort();
  
  // Standard days to match against the "Mon/Wed/Fri" string formats
  const standardDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const filteredSchedules = schedules.filter(s => {
    const matchesSearch = (s.subject_Code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.section_ID || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.subject_Title || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRoom = roomFilter ? s.room_ID === roomFilter : true;
    const matchesProf = profFilter ? (s.professor_Name === profFilter || s.professor_ID === profFilter) : true;
    
    // NEW: Checks if the schedule's class_Days string contains the selected day (e.g. "Mon")
    const matchesDay = dayFilter ? (s.class_Days || '').toLowerCase().includes(dayFilter.toLowerCase()) : true;

    return matchesSearch && matchesRoom && matchesProf && matchesDay;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <FaceZoomModal zoomedImage={zoomedImage} onClose={() => setZoomedImage(null)} />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Schedule Directory</h2>
          <p className="text-slate-500 mt-1 font-medium">Monitor room allocations, faculty workloads, and resolve scheduling conflicts.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 font-bold text-sm flex items-center gap-2 shadow-sm">
          <CalendarDays size={18} /> {schedules.length} Total Classes
        </div>
      </div>

      {/* THE FIX: Changed to a 4-column grid (lg:grid-cols-4) to fit the new Day filter evenly */}
      <div className="p-5 border border-slate-200 bg-white rounded-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search Subject or Section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200">
              <X size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Room Filter */}
        <div className="relative w-full">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-slate-700 cursor-pointer"
          >
            <option value="">All Rooms</option>
            {uniqueRooms.map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {roomFilter ? (
                <button onClick={() => setRoomFilter('')} className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50 bg-slate-50">
                  <X size={16} strokeWidth={2.5} />
                </button>
            ) : (
                <ChevronDown size={16} className="text-slate-400 pointer-events-none" />
            )}
          </div>
        </div>

        {/* Professor Filter */}
        <div className="relative w-full">
          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={profFilter}
            onChange={(e) => setProfFilter(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-slate-700 cursor-pointer"
          >
            <option value="">All Faculty</option>
            {uniqueProfs.map(prof => (
              <option key={prof} value={prof}>{prof}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {profFilter ? (
                <button onClick={() => setProfFilter('')} className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50 bg-slate-50">
                  <X size={16} strokeWidth={2.5} />
                </button>
            ) : (
                <ChevronDown size={16} className="text-slate-400 pointer-events-none" />
            )}
          </div>
        </div>

        {/* NEW: Day Filter */}
        <div className="relative w-full">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-slate-700 cursor-pointer"
          >
            <option value="">All Days</option>
            {standardDays.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {dayFilter ? (
                <button onClick={() => setDayFilter('')} className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50 bg-slate-50">
                  <X size={16} strokeWidth={2.5} />
                </button>
            ) : (
                <ChevronDown size={16} className="text-slate-400 pointer-events-none" />
            )}
          </div>
        </div>

      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading global schedule data...</div>
        ) : (
          <MasterScheduleTable schedules={filteredSchedules} onZoom={setZoomedImage} />
        )}
      </div>
    </div>
  );
}