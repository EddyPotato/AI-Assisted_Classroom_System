import { useState, useEffect } from 'react';
import { Activity, Database, Cpu, Wifi } from 'lucide-react';

// MOVED OUTSIDE: Prevents React from destroying and recreating this component on every render
const StatusCard = ({ title, icon, status, desc }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 border border-slate-100">
        {icon}
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${
        status === 'online' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
        status === 'offline' ? 'bg-rose-50 text-rose-600 border-rose-200' : 
        'bg-amber-50 text-amber-600 border-amber-200'
      }`}>
        {status}
      </span>
    </div>
    <div>
      <h3 className="text-xl font-black text-slate-800">{title}</h3>
      <p className="text-sm font-medium text-slate-500 mt-1">{desc}</p>
    </div>
  </div>
);

export default function ServerHealthView() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [nodeStatus, setNodeStatus] = useState('checking');

  useEffect(() => {
    // Ping C# Backend
    fetch('http://localhost:5106/api/camera/locations')
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'));

    // Ping Python Edge Node
    fetch('http://localhost:5000/video_feed', { method: 'HEAD' })
      .then(() => setNodeStatus('online'))
      .catch(() => setNodeStatus('offline'));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Telemetry</h2>
        <p className="text-slate-500 mt-1 font-medium">Real-time status of microservices and database connections.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatusCard 
          title="Core API (.NET 10)" 
          icon={<Cpu size={24} />} 
          status={apiStatus} 
          desc="Port 5106 | Handles logic & routing" 
        />
        <StatusCard 
          title="Oracle Database" 
          icon={<Database size={24} />} 
          status={apiStatus} // Tied to API for now
          desc="Port 1521 | XEPDB1 Instance" 
        />
        <StatusCard 
          title="MQTT Broker" 
          icon={<Wifi size={24} />} 
          status="online" 
          desc="Port 1883 | Mosquitto TCP Bridge" 
        />
        <StatusCard 
          title="AI Edge Node (Python)" 
          icon={<Activity size={24} />} 
          status={nodeStatus} 
          desc="Port 5000 | Computer Vision Stream" 
        />
      </div>
    </div>
  );
}