import { Server, Shield, Bell, Camera } from 'lucide-react';

export default function SystemSettings() {
  return (
    <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">System Settings</h2>
          <p className="text-gray-500 mt-1 font-medium">Configure network, hardware, and security protocols.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-6">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Server size={20} className="text-blue-500" /> Network & Database
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">C# API Endpoint</label>
                <input type="text" defaultValue="http://localhost:5106/api" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-700 outline-none" disabled />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mosquitto Broker</label>
                <input type="text" defaultValue="tcp://localhost:1883" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-700 outline-none" disabled />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Camera size={20} className="text-emerald-500" /> Python Edge Node (Raspberry Pi)
            </h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-800">MJPEG Video Stream</p>
                <p className="text-xs font-medium text-gray-500">Enable receiving live headless video from the scanner node.</p>
              </div>
              <div className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer shadow-inner">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Shield size={20} className="text-rose-500" /> Security
            </h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-800">Auto-Lock Doors</p>
                <p className="text-xs font-medium text-gray-500">Automatically trigger electronic locks when Professor is not detected.</p>
              </div>
              <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer shadow-inner">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}