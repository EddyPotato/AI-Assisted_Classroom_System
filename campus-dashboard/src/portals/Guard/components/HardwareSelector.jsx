import { useState } from 'react';
import { Usb, ChevronDown } from 'lucide-react';

export default function HardwareSelector({ videoDevices, hardwareIndex, onHardwareIndexChange, isFullscreen }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedHw = videoDevices?.find(d => d.index === hardwareIndex) || videoDevices?.[0] || { label: 'System Default Camera' };

  return (
    <div className="relative w-full lg:w-80">
      <div 
         onClick={() => setIsOpen(!isOpen)}
         className={`flex items-center justify-between border rounded-xl sm:rounded-2xl px-4 py-3 sm:py-3.5 w-full select-none transition-colors cursor-pointer ${
          isFullscreen ? 'hover:border-slate-500 bg-slate-700 border-slate-600' : 'hover:border-slate-400 bg-white border-slate-300'
        }`}
      >
         <div className="flex items-center gap-3 overflow-hidden">
           <Usb className={isFullscreen ? "text-slate-400 shrink-0" : "text-slate-400 shrink-0"} size={22} />
           <span className={`font-black text-base truncate ${isFullscreen ? 'text-white' : 'text-slate-800'}`}>
             {selectedHw.label}
           </span>
         </div>
         <ChevronDown size={20} className="text-slate-400 shrink-0 ml-2" />
      </div>

      {isOpen && (
        <div className={`absolute top-full left-0 w-full mt-2 border rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto py-2 ${isFullscreen ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}>
          {videoDevices && videoDevices.length > 0 ? (
            videoDevices.map(cam => (
              <div key={cam.index} onMouseDown={() => { onHardwareIndexChange(cam.index); setIsOpen(false); }} className={`px-5 py-3 cursor-pointer transition-colors truncate ${isFullscreen ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
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
  );
}