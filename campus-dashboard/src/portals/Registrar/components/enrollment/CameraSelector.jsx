import { Video } from 'lucide-react';

export default function CameraSelector({ videoDevices, selectedDeviceId, onSelectDevice }) {
  if (videoDevices.length === 0) return null;

  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-xl w-full sm:w-72 shadow-sm transition-all hover:bg-slate-50 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
      <Video size={18} className="text-primary-500 shrink-0" />
      <select 
        value={selectedDeviceId} 
        onChange={(e) => onSelectDevice(e.target.value)}
        className="text-sm font-bold text-slate-700 bg-transparent outline-none w-full truncate cursor-pointer"
      >
        {videoDevices.map((cam, idx) => (
          <option key={cam.deviceId} value={cam.deviceId}>
            {cam.label || `System Camera ${idx + 1}`}
          </option>
        ))}
      </select>
    </div>
  );
}