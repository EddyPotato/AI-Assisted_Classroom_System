import { useState } from 'react';
import { Video, VideoOff, MapPin, Usb, Search, ChevronDown, Maximize, Minimize } from 'lucide-react';

export default function CameraControls({ 
  streamStatus, 
  onStart, 
  onStop, 
  locations, 
  currentLocationId, 
  onLocationChange,
  hardwareIndex,
  onHardwareIndexChange,
  videoDevices,
  isFullscreen,
  toggleFullscreen
}) {
  const [isLocOpen, setIsLocOpen] = useState(false);
  const [locSearch, setLocSearch] = useState('');
  const [isHwOpen, setIsHwOpen] = useState(false);

  const selectedLoc = locations.find(l => l.location_ID === currentLocationId);

  const filteredLocs = locations.filter(l => 
    l.camera_Name?.toLowerCase().includes(locSearch.toLowerCase()) ||
    l.associated_Room_Id?.toLowerCase().includes(locSearch.toLowerCase()) ||
    l.location_ID?.toLowerCase().includes(locSearch.toLowerCase())
  );

  const selectedHw = videoDevices?.find(d => d.index === hardwareIndex) || videoDevices?.[0] || { label: 'System Default Camera' };

  const handleSelectLocation = (id) => {
    onLocationChange(id);
    setIsLocOpen(false);
    setLocSearch('');
  };

  return (
    <div className={`${isFullscreen ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} border rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-3 sm:gap-4 shrink-0 relative transition-colors duration-300`}>
      
      <div className="flex flex-col lg:flex-row items-center gap-3 w-full xl:w-auto flex-1 min-w-0">
        
        {/* SIMPLIFIED SMART LOCATION DROPDOWN */}
        <div className="relative w-full lg:flex-1 lg:max-w-md">
          {selectedLoc && !isLocOpen ? (
            <div 
               onClick={() => { if (streamStatus !== 'active' && streamStatus !== 'loading') setIsLocOpen(true); }}
               className={`flex items-center justify-between border rounded-xl sm:rounded-2xl px-4 py-3 sm:py-3.5 w-full select-none transition-colors ${
                 streamStatus === 'active' || streamStatus === 'loading' 
                   ? (isFullscreen ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-700' : 'opacity-70 cursor-not-allowed bg-slate-50 border-slate-300')
                   : (isFullscreen ? 'cursor-pointer hover:border-slate-500 bg-slate-700 border-slate-600' : 'cursor-pointer hover:border-slate-400 bg-white border-slate-300')
               }`}
            >
               <div className="flex items-center gap-3 overflow-hidden">
                 <MapPin className={isFullscreen ? "text-blue-400 shrink-0" : "text-slate-400 shrink-0"} size={22} />
                 <span className={`font-black text-lg truncate ${isFullscreen ? 'text-white' : 'text-slate-800'}`}>
                   {selectedLoc.camera_Name}
                 </span>
               </div>
               <ChevronDown size={20} className={isFullscreen ? "text-slate-400 shrink-0 ml-2" : "text-slate-400 shrink-0 ml-2"} />
            </div>
          ) : (
            <div className="relative w-full">
              <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
              <input 
                 autoFocus={isLocOpen}
                 type="text" 
                 value={locSearch} 
                 onChange={(e) => { setLocSearch(e.target.value); setIsLocOpen(true); }}
                 onBlur={() => setTimeout(() => setIsLocOpen(false), 200)}
                 placeholder="Search locations..." 
                 className={`w-full pl-12 pr-4 py-3 sm:py-3.5 border rounded-xl sm:rounded-2xl outline-none font-black text-lg m-0 box-border transition-colors ${
                   isFullscreen 
                    ? 'bg-slate-700 border-blue-500 text-white placeholder:text-slate-400 ring-4 ring-blue-500/20' 
                    : 'bg-white border-blue-500 text-slate-800 placeholder:text-slate-400 ring-4 ring-blue-500/10'
                 }`} 
              />
            </div>
          )}

          {isLocOpen && (
            <div className={`absolute top-full left-0 w-full mt-2 border rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto py-2 ${isFullscreen ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}>
              {filteredLocs.map(loc => (
                <div 
                  key={loc.location_ID} 
                  onMouseDown={() => handleSelectLocation(loc.location_ID)} 
                  className={`px-5 py-3 cursor-pointer transition-colors ${isFullscreen ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}
                >
                  <span className={`text-lg font-black ${isFullscreen ? 'text-white' : 'text-slate-800'}`}>{loc.camera_Name}</span>
                </div>
              ))}
              {filteredLocs.length === 0 && (
                <div className={`p-4 text-center text-sm font-bold ${isFullscreen ? 'text-slate-400' : 'text-slate-400'}`}>No locations found.</div>
              )}
            </div>
          )}
        </div>

        {/* CUSTOM HARDWARE DROPDOWN */}
        <div className="relative w-full lg:w-80">
          <div 
             onClick={() => { if (streamStatus !== 'active' && streamStatus !== 'loading') setIsHwOpen(!isHwOpen); }}
             className={`flex items-center justify-between border rounded-xl sm:rounded-2xl px-4 py-3 sm:py-3.5 w-full select-none transition-colors ${
              streamStatus === 'active' || streamStatus === 'loading' 
                ? (isFullscreen ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-700' : 'opacity-70 cursor-not-allowed bg-slate-50 border-slate-300')
                : (isFullscreen ? 'cursor-pointer hover:border-slate-500 bg-slate-700 border-slate-600' : 'cursor-pointer hover:border-slate-400 bg-white border-slate-300')
            }`}
          >
             <div className="flex items-center gap-3 overflow-hidden">
               <Usb className={isFullscreen ? "text-slate-400 shrink-0" : "text-slate-400 shrink-0"} size={22} />
               <span className={`font-black text-base truncate ${isFullscreen ? 'text-white' : 'text-slate-800'}`}>
                 {selectedHw.label}
               </span>
             </div>
             <ChevronDown size={20} className={isFullscreen ? "text-slate-400 shrink-0 ml-2" : "text-slate-400 shrink-0 ml-2"} />
          </div>

          {isHwOpen && (
            <div className={`absolute top-full left-0 w-full mt-2 border rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto py-2 ${isFullscreen ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}>
              {videoDevices && videoDevices.length > 0 ? (
                videoDevices.map(cam => (
                  <div 
                    key={cam.index} 
                    onMouseDown={() => { onHardwareIndexChange(cam.index); setIsHwOpen(false); }} 
                    className={`px-5 py-3 cursor-pointer transition-colors truncate ${isFullscreen ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}
                  >
                    <span className={`text-base font-black ${isFullscreen ? 'text-white' : 'text-slate-800'}`}>{cam.label}</span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-3">
                  <span className={`text-base font-black ${isFullscreen ? 'text-white' : 'text-slate-800'}`}>System Default Camera</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-2 w-full xl:w-auto shrink-0">
        {streamStatus === 'active' || streamStatus === 'loading' ? (
          <button 
            onClick={onStop}
            className={`flex-1 xl:flex-none flex items-center justify-center gap-2 font-black text-sm sm:text-base px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border transition-colors active:scale-95 whitespace-nowrap shadow-sm ${
              isFullscreen 
                ? 'bg-rose-900/50 hover:bg-rose-900 text-rose-400 border-rose-800' 
                : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
            }`}
          >
            <VideoOff size={18} strokeWidth={2.5} /> Stop Monitoring
          </button>
        ) : (
          <button 
            onClick={onStart}
            className={`flex-1 xl:flex-none flex items-center justify-center gap-2 font-black text-sm sm:text-base px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border transition-colors active:scale-95 whitespace-nowrap shadow-sm ${
              isFullscreen 
                ? 'bg-emerald-900/50 hover:bg-emerald-900 text-emerald-400 border-emerald-800' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
            }`}
          >
            <Video size={18} strokeWidth={2.5} /> Start Monitoring
          </button>
        )}

        {/* FULLSCREEN TOGGLE */}
        <button 
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Enterprise Kiosk Mode"}
          className={`flex items-center justify-center p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-colors active:scale-95 shadow-sm shrink-0 ${
            isFullscreen 
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600' 
              : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
          }`}
        >
          {isFullscreen ? <Minimize size={20} strokeWidth={2.5} /> : <Maximize size={20} strokeWidth={2.5} />}
        </button>

      </div>
    </div>
  );
}