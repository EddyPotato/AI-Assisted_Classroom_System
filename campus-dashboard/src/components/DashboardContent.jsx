import { Video, User, UserCheck } from 'lucide-react';

export default function DashboardContent({ roomState, occupancy, lastScanned }) {
  return (
    <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Room 302 Overview</h2>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide border ${
            roomState.includes('LOCKED') 
              ? 'bg-red-50 text-red-700 border-red-200' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {roomState}
          </span>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase">Current Occupancy</p>
            <p className="text-4xl font-black text-gray-800 mt-2">{occupancy} <span className="text-lg text-gray-400 font-medium">/ 50</span></p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-semibold text-orange-500 uppercase">On Break</p>
            <p className="text-4xl font-black text-orange-600 mt-2">0</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-semibold text-rose-500 uppercase">Active Alerts</p>
            <p className="text-4xl font-black text-rose-600 mt-2">0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Camera Feed Placeholder */}
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-md aspect-video relative flex items-center justify-center border border-slate-700">
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">LIVE</span>
              <span className="bg-black/50 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm">EDGE NODE CAM</span>
            </div>
            <div className="text-center">
              <Video className="mx-auto text-emerald-500 mb-3" size={48} />
              <p className="text-slate-300 font-medium">Listening for Hardware Scanner...</p>
            </div>
          </div>

          {/* Dynamic Identity Match Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Last Identity Match</h3>
            
            {lastScanned ? (
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                  <User size={40} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">
                    {lastScanned.first_Name} {lastScanned.last_Name}
                  </h4>
                  <p className="text-gray-500 font-mono mt-1 text-sm">ID: {lastScanned.student_ID}</p>
                  <p className="text-xs text-emerald-600 mt-2 bg-emerald-50 p-2 rounded border border-emerald-100 font-medium">
                    ✓ Verified via Database
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <UserCheck size={32} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">Waiting for scan event...</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}