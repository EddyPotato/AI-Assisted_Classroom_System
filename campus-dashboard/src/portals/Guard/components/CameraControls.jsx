import { useState } from 'react';
import { Video, VideoOff, MapPin, Usb, Search, DoorOpen, Presentation } from 'lucide-react';

export default function CameraControls({ 
  streamStatus, 
  onStart, 
  onStop, 
  locations, 
  currentLocationId, 
  onLocationChange,
  hardwareIndex,
  onHardwareIndexChange,
  videoDevices
}) {
  const [isLocOpen, setIsLocOpen] = useState(false);
  const [locSearch, setLocSearch] = useState('');

  // Find the currently selected location object
  const selectedLoc = locations.find(l => l.location_ID === currentLocationId);

  // Filter locations based on search query
  const filteredLocs = locations.filter(l => 
    l.camera_Name?.toLowerCase().includes(locSearch.toLowerCase()) ||
    l.location_Type?.toLowerCase().includes(locSearch.toLowerCase()) ||
    l.associated_Room_Id?.toLowerCase().includes(locSearch.toLowerCase()) ||
    l.location_ID?.toLowerCase().includes(locSearch.toLowerCase())
  );

  // Categorize for the UI
  const gates = filteredLocs.filter(l => !l.associated_Room_Id || l.associated_Room_Id.trim() === '');
  const rooms = filteredLocs.filter(l => l.associated_Room_Id && l.associated_Room_Id.trim() !== '');

  const handleSelectLocation = (id) => {
    onLocationChange(id);
    setIsLocOpen(false);
    setLocSearch('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-3 sm:gap-4 shrink-0 relative">
      
      <div className="flex flex-col lg:flex-row items-center gap-3 w-full xl:w-auto flex-1 min-w-0">
        
        {/* SMART LOCATION DROPDOWN */}
        <div className="relative w-full lg:flex-1 lg:max-w-md">
          {selectedLoc && !isLocOpen ? (
            <div 
               onClick={() => { if (streamStatus !== 'active' && streamStatus !== 'loading') setIsLocOpen(true); }}
               className={`flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-4 py-2 sm:py-2.5 transition-all w-full select-none ${streamStatus === 'active' || streamStatus === 'loading' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400 hover:bg-white focus:ring-2 focus:ring-blue-500/20'}`}
            >
               <div className="flex items-center gap-3 overflow-hidden">
                 <MapPin className="text-blue-500 shrink-0" size={22} />
                 <div className="flex flex-col min-w-0">
                   <span className="font-black text-slate-800 text-sm sm:text-base leading-tight truncate">
                     {selectedLoc.camera_Name}
                   </span>
                   <span className="text-[10px] sm:text-xs font-bold text-slate-500 truncate uppercase tracking-wider">
                     {selectedLoc.associated_Room_Id ? `Room: ${selectedLoc.associated_Room_Id}` : selectedLoc.location_Type}
                   </span>
                 </div>
               </div>
               <Search size={16} className="text-slate-400 shrink-0 ml-2" />
            </div>
          ) : (
            <div className="relative w-full">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                 autoFocus={isLocOpen}
                 type="text" 
                 value={locSearch} 
                 onChange={(e) => { setLocSearch(e.target.value); setIsLocOpen(true); }}
                 onFocus={() => setIsLocOpen(true)}
                 onBlur={() => setTimeout(() => setIsLocOpen(false), 200)}
                 placeholder="Search gates or rooms (e.g. IL606)..." 
                 className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-white border border-blue-400 rounded-xl sm:rounded-2xl outline-none ring-4 ring-blue-500/10 font-bold text-slate-800 text-sm sm:text-base transition-all" 
              />
            </div>
          )}

          {/* Location Suggestions Panel */}
          {isLocOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-100">
              
              {/* Category: Gates */}
              {gates.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Campus Gates</div>
                  {gates.map(loc => (
                    <div key={loc.location_ID} onMouseDown={() => handleSelectLocation(loc.location_ID)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors text-slate-400"><DoorOpen size={16}/></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 group-hover:text-blue-700">{loc.camera_Name}</span>
                        <span className="text-xs font-bold text-slate-500">{loc.location_Type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Category: Rooms */}
              {rooms.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classrooms / Labs</div>
                  {rooms.map(loc => (
                    <div key={loc.location_ID} onMouseDown={() => handleSelectLocation(loc.location_ID)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 cursor-pointer transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors text-slate-400"><Presentation size={16}/></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 group-hover:text-emerald-700">{loc.associated_Room_Id} Station</span>
                        <span className="text-xs font-bold text-slate-500">{loc.camera_Name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredLocs.length === 0 && <div className="p-4 text-center text-sm font-bold text-slate-400">No locations match your search.</div>}
            </div>
          )}
        </div>

        {/* NATIVE HARDWARE DROPDOWN */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full flex items-center group">
            <div className="absolute left-4 z-10">
              <Usb className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={22} />
            </div>
            <select 
              value={hardwareIndex}
              onChange={(e) => onHardwareIndexChange(parseInt(e.target.value))}
              disabled={streamStatus === 'active' || streamStatus === 'loading'}
              className="bg-slate-50 border border-slate-200 text-slate-700 font-black text-sm sm:text-base rounded-xl sm:rounded-2xl pl-12 pr-10 py-2 sm:py-3 outline-none hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all w-full appearance-none cursor-pointer"
            >
              {videoDevices?.length > 0 ? (
                videoDevices.map(cam => (
                  <option key={cam.index} value={cam.index}>
                    {cam.label}
                  </option>
                ))
              ) : (
                <option value={0}>System Default Camera</option>
              )}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-4 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-3 w-full xl:w-auto shrink-0">
        {streamStatus === 'active' || streamStatus === 'loading' ? (
          <button 
            onClick={onStop}
            className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-sm sm:text-base px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-rose-200 transition-colors active:scale-95 whitespace-nowrap shadow-sm"
          >
            <VideoOff size={18} strokeWidth={2.5} /> Stop Monitoring
          </button>
        ) : (
          <button 
            onClick={onStart}
            className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-black text-sm sm:text-base px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-emerald-200 transition-colors active:scale-95 whitespace-nowrap shadow-sm"
          >
            <Video size={18} strokeWidth={2.5} /> Start Monitoring
          </button>
        )}
      </div>
    </div>
  );
}