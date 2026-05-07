import { useState } from 'react';
import { Search, MapPin, UserCircle, CalendarDays, Clock, X, ChevronDown, Building2 } from 'lucide-react';
import MasterScheduleTable from './MasterScheduleTable';
import FaceZoomModal from '../users/FaceZoomModal';
import { useGlobalScheduleLogic } from './hooks/useGlobalScheduleLogic';

export default function SchedulesTab() {
  const [cacheBuster] = useState(() => Date.now());
  const standardDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const {
    isLoading, sortedSchedules, uniqueRooms, uniqueProfs,
    zoomedImage, setZoomedImage, searchQuery, setSearchQuery,
    roomSearch, setRoomSearch, profSearch, setProfSearch,
    isRoomDropdownOpen, setIsRoomDropdownOpen,
    isProfDropdownOpen, setIsProfDropdownOpen,
    dayFilter, setDayFilter, timeStartFilter, setTimeStartFilter,
    timeEndFilter, setTimeEndFilter, sortConfig, handleSort
  } = useGlobalScheduleLogic();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <FaceZoomModal zoomedImage={zoomedImage} onClose={() => setZoomedImage(null)} />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Schedule Directory</h2>
          <p className="text-slate-500 mt-1 font-medium">Monitor room allocations, faculty workloads, and resolve scheduling conflicts.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 font-bold text-sm flex items-center gap-2 shadow-sm">
          <CalendarDays size={18} /> {sortedSchedules.length} Classes Found
        </div>
      </div>

      <div className="p-5 border border-slate-200 bg-white rounded-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 shadow-sm">
        
        {/* ROW 1: Basic Search & Autocompletes */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search Section Name or Subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50 bg-slate-50">
              <X size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Room Autocomplete Filter */}
        <div className="relative w-full z-20">
          <div className="relative">
             <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
                type="text" 
                value={roomSearch} 
                onChange={(e) => { setRoomSearch(e.target.value); setIsRoomDropdownOpen(true); }}
                onFocus={() => setIsRoomDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsRoomDropdownOpen(false), 200)}
                placeholder="Search Room or Building..." 
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm" 
             />
             {roomSearch && (
                <button onClick={() => setRoomSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50 bg-slate-50">
                  <X size={16} strokeWidth={2.5} />
                </button>
             )}
          </div>
          
          {isRoomDropdownOpen && (
             <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-50">
                <div className="p-3 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">Room Suggestions</div>
                {uniqueRooms.filter(r => r.id.toLowerCase().includes(roomSearch.toLowerCase()) || (r.building || '').toLowerCase().includes(roomSearch.toLowerCase())).map(room => (
                    <div key={room.id} onMouseDown={() => setRoomSearch(room.id)} className="flex items-center gap-3 p-3 hover:bg-emerald-50 cursor-pointer transition-colors group">
                       <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-emerald-600"><Building2 size={16}/></div>
                       <div>
                          <p className="font-black text-slate-800 text-sm group-hover:text-emerald-700">{room.id}</p>
                          <p className="text-[10px] font-bold text-slate-500">{room.building}</p>
                       </div>
                    </div>
                ))}
                {uniqueRooms.length === 0 && <div className="p-4 text-center text-xs font-bold text-slate-400">No rooms loaded.</div>}
             </div>
          )}
        </div>

        {/* Professor Autocomplete Filter */}
        <div className="relative w-full z-10">
          <div className="relative">
             <UserCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
                type="text" 
                value={profSearch} 
                onChange={(e) => { setProfSearch(e.target.value); setIsProfDropdownOpen(true); }}
                onFocus={() => setIsProfDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsProfDropdownOpen(false), 200)}
                placeholder="Search Professor..." 
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm" 
             />
             {profSearch && (
                <button onClick={() => setProfSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50 bg-slate-50">
                  <X size={16} strokeWidth={2.5} />
                </button>
             )}
          </div>
          
          {isProfDropdownOpen && (
             <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-50">
                <div className="p-3 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">Professor Suggestions</div>
                {uniqueProfs.filter(p => p.name.toLowerCase().includes(profSearch.toLowerCase()) || p.id.toLowerCase().includes(profSearch.toLowerCase())).map(prof => (
                    <div key={prof.id} onMouseDown={() => setProfSearch(prof.name)} className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors group">
                       {prof.face && !prof.face.includes("C:") ? (
                          <img src={`http://localhost:5106/ReferenceFaces/${prof.face}?t=${cacheBuster}`} className="w-8 h-8 object-cover rounded-full border border-slate-200 shadow-sm" alt="avatar" />
                       ) : (
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><UserCircle size={16}/></div>
                       )}
                       <div>
                          <p className="font-black text-slate-800 text-sm group-hover:text-blue-700">{prof.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 font-mono">{prof.id}</p>
                       </div>
                    </div>
                ))}
                {uniqueProfs.length === 0 && <div className="p-4 text-center text-xs font-bold text-slate-400">No professors loaded.</div>}
             </div>
          )}
        </div>

        {/* ROW 2: Time & Day Filters */}
        <div className="relative w-full">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-slate-700 cursor-pointer shadow-sm"
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

        {/* Split Time Range Filter */}
        <div className="relative w-full lg:col-span-2 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
          <Clock className="text-slate-400 shrink-0" size={18} />
          
          <div className="flex flex-1 items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">From</span>
            <input 
              type="time" 
              value={timeStartFilter} 
              onChange={(e) => setTimeStartFilter(e.target.value)} 
              className="flex-1 bg-transparent text-sm font-bold text-slate-700 outline-none cursor-text py-2.5" 
            />
          </div>
          
          <div className="w-px h-6 bg-slate-200"></div>
          
          <div className="flex flex-1 items-center gap-2 pl-2">
            <span className="text-xs font-bold text-slate-400 uppercase">To</span>
            <input 
              type="time" 
              value={timeEndFilter} 
              onChange={(e) => setTimeEndFilter(e.target.value)} 
              className="flex-1 bg-transparent text-sm font-bold text-slate-700 outline-none cursor-text py-2.5" 
            />
          </div>

          {(timeStartFilter || timeEndFilter) && (
            <button 
               onClick={() => { setTimeStartFilter(''); setTimeEndFilter(''); }} 
               className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-md hover:bg-rose-50 bg-white shadow-sm border border-slate-200"
               title="Clear Time Range"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>

      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-blue-600 font-bold animate-pulse">
             <Clock size={32} className="mb-3 opacity-50 animate-spin" />
             Loading global schedule data...
          </div>
        ) : sortedSchedules.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
               <CalendarDays size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800">No schedules match your current filters.</h3>
            <p className="text-slate-500 mt-2">Try adjusting your time ranges or clearing the day filter.</p>
          </div>
        ) : (
          <MasterScheduleTable schedules={sortedSchedules} onZoom={setZoomedImage} sortConfig={sortConfig} onSort={handleSort} />
        )}
      </div>
    </div>
  );
}
