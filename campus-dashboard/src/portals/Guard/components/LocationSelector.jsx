import { useState } from 'react';
import { MapPin, Search, ChevronDown } from 'lucide-react';

export default function LocationSelector({ locations, currentLocationId, onLocationChange, isFullscreen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedLoc = locations.find(l => l.location_ID === currentLocationId);
  const filteredLocs = locations.filter(l => 
    l.camera_Name?.toLowerCase().includes(search.toLowerCase()) ||
    l.associated_Room_Id?.toLowerCase().includes(search.toLowerCase()) ||
    l.location_ID?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id) => {
    onLocationChange(id);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative w-full lg:flex-1 lg:max-w-md">
      {selectedLoc && !isOpen ? (
        <div 
           onClick={() => setIsOpen(true)}
           className={`flex items-center justify-between border rounded-xl sm:rounded-2xl px-4 py-3 sm:py-3.5 w-full select-none transition-colors cursor-pointer ${
             isFullscreen ? 'hover:border-slate-500 bg-slate-700 border-slate-600' : 'hover:border-slate-400 bg-white border-slate-300'
           }`}
        >
           <div className="flex items-center gap-3 overflow-hidden">
             <MapPin className={isFullscreen ? "text-blue-400 shrink-0" : "text-slate-400 shrink-0"} size={22} />
             <span className={`font-black text-lg truncate ${isFullscreen ? 'text-white' : 'text-slate-800'}`}>
               {selectedLoc.camera_Name}
             </span>
           </div>
           <ChevronDown size={20} className="text-slate-400 shrink-0 ml-2" />
        </div>
      ) : (
        <div className="relative w-full">
          <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
          <input 
             autoFocus={isOpen}
             type="text" 
             value={search} 
             onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
             onBlur={() => setTimeout(() => setIsOpen(false), 200)}
             placeholder="Search locations..." 
             className={`w-full pl-12 pr-4 py-3 sm:py-3.5 border rounded-xl sm:rounded-2xl outline-none font-black text-lg m-0 box-border transition-colors ${
               isFullscreen ? 'bg-slate-700 border-blue-500 text-white placeholder:text-slate-400 ring-4 ring-blue-500/20' : 'bg-white border-blue-500 text-slate-800 placeholder:text-slate-400 ring-4 ring-blue-500/10'
             }`} 
          />
        </div>
      )}

      {isOpen && (
        <div className={`absolute top-full left-0 w-full mt-2 border rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto py-2 ${isFullscreen ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}>
          {filteredLocs.map(loc => (
            <div key={loc.location_ID} onMouseDown={() => handleSelect(loc.location_ID)} className={`px-5 py-3 cursor-pointer transition-colors ${isFullscreen ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
              <span className={`text-lg font-black ${isFullscreen ? 'text-white' : 'text-slate-800'}`}>{loc.camera_Name}</span>
            </div>
          ))}
          {filteredLocs.length === 0 && (
            <div className={`p-4 text-center text-sm font-bold ${isFullscreen ? 'text-slate-400' : 'text-slate-400'}`}>No locations found.</div>
          )}
        </div>
      )}
    </div>
  );
}