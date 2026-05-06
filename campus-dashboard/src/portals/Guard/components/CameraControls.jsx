import { Video, VideoOff, MapPin } from 'lucide-react';

export default function CameraControls({ 
  streamStatus, 
  onStart, 
  onStop, 
  locations, 
  currentLocationId, 
  onLocationChange 
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
        <MapPin className="text-slate-400 shrink-0" size={24} />
        {/* Increased width significantly */}
        <select 
          value={currentLocationId}
          onChange={(e) => onLocationChange(e.target.value)}
          disabled={streamStatus === 'active' || streamStatus === 'loading'}
          className="bg-slate-50 border border-slate-200 text-slate-700 font-black text-lg rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all w-full sm:w-100 lg:w-125"
        >
          {locations.map(loc => (
            <option key={loc.location_ID} value={loc.location_ID}>
              {loc.camera_Name} ({loc.location_Type})
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
        {streamStatus === 'active' || streamStatus === 'loading' ? (
          <button 
            onClick={onStop}
            className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-lg px-8 py-3 rounded-2xl border border-rose-200 transition-colors active:scale-95"
          >
            <VideoOff size={20} /> Turn Off Camera
          </button>
        ) : (
          <button 
            onClick={onStart}
            className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-black text-lg px-8 py-3 rounded-2xl border border-emerald-200 transition-colors active:scale-95"
          >
            <Video size={20} /> Start Camera
          </button>
        )}
      </div>
    </div>
  );
}