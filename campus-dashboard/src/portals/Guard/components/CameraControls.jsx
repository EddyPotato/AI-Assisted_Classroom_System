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
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <MapPin className="text-slate-400" size={20} />
        <select 
          value={currentLocationId}
          onChange={(e) => onLocationChange(e.target.value)}
          disabled={streamStatus === 'active' || streamStatus === 'loading'}
          className="bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all flex-1 sm:w-64"
        >
          {locations.map(loc => (
            <option key={loc.location_ID} value={loc.location_ID}>
              {loc.camera_Name} ({loc.location_Type})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {streamStatus === 'active' || streamStatus === 'loading' ? (
          <button 
            onClick={onStop}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black px-6 py-2.5 rounded-xl border border-rose-200 transition-colors active:scale-95"
          >
            <VideoOff size={18} /> Turn Off Camera
          </button>
        ) : (
          <button 
            onClick={onStart}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-black px-6 py-2.5 rounded-xl border border-emerald-200 transition-colors active:scale-95"
          >
            <Video size={18} /> Start Camera
          </button>
        )}
      </div>
    </div>
  );
}