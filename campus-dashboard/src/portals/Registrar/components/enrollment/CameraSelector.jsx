import { Video } from 'lucide-react';

export default function CameraSelector({ videoDevices, selectedDeviceId, onSelectDevice }) {
  if (videoDevices.length === 0) return null;

  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
      <Video size={14} className="text-slate-400" />
      <select 
        value={selectedDeviceId} 
        onChange={(e) => onSelectDevice(e.target.value)}
        className="text-xs font-bold text-slate-600 bg-transparent outline-none max-w-37.5 truncate cursor-pointer"
      >
        {videoDevices.map((cam, idx) => (
          <option key={cam.deviceId} value={cam.deviceId}>
            {cam.label || `Camera ${idx + 1}`}
          </option>
        ))}
      </select>
    </div>
  );
}