import { useState, useEffect } from 'react';
import { Search, MapPin, UserCircle, CalendarDays } from 'lucide-react';
import MasterScheduleTable from './MasterScheduleTable';
import FaceZoomModal from '../users/FaceZoomModal';

export default function SchedulesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [profFilter, setProfFilter] = useState('');
  
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

  const filteredSchedules = schedules.filter(s => {
    const matchesSearch = (s.subject_Code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.section_ID || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.subject_Title || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRoom = roomFilter ? s.room_ID === roomFilter : true;
    const matchesProf = profFilter ? (s.professor_Name === profFilter || s.professor_ID === profFilter) : true;

    return matchesSearch && matchesRoom && matchesProf;
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

      <div className="p-5 border border-slate-200 bg-white rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search Subject, Title, or Section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="relative w-full">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-slate-700 cursor-pointer"
          >
            <option value="">All Rooms</option>
            {uniqueRooms.map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full">
          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={profFilter}
            onChange={(e) => setProfFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-slate-700 cursor-pointer"
          >
            <option value="">All Faculty</option>
            {uniqueProfs.map(prof => (
              <option key={prof} value={prof}>{prof}</option>
            ))}
          </select>
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