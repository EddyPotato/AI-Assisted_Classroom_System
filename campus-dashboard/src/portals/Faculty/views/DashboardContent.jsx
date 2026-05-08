import { useState } from 'react';
import { Video, User, UserCheck, ArrowLeft, Users } from 'lucide-react';

export default function DashboardContent({ roomName, roomState, occupancy, lastScanned, onBack }) {
  const [camOnline, setCamOnline] = useState(true);

  return (
    <div className="h-screen w-full flex flex-col font-sans overflow-hidden bg-slate-50 text-slate-900">
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto relative">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* HIERARCHICAL HEADER WITH BACK BUTTON */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm"
                title="Back to Campus Overview"
              >
                <ArrowLeft size={22} strokeWidth={2.5} />
              </button>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">{roomName}</h2>
            </div>
            
            <span className={`px-4 py-2 rounded-xl text-sm font-black tracking-widest border shadow-sm ${
              roomState.includes('LOCKED') 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {roomState}
            </span>
          </div>

          {/* Minimalist Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-blue-50 opacity-50"><Users size={100} /></div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider relative z-10">Current Occupancy</p>
              <p className="text-4xl font-black text-blue-600 mt-2 relative z-10 tracking-tighter">{occupancy} <span className="text-lg text-gray-300 font-semibold tracking-normal">/ 50</span></p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider">On Break</p>
              <p className="text-4xl font-black text-amber-500 mt-2 tracking-tighter">0</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Active Alerts</p>
              <p className="text-4xl font-black text-rose-500 mt-2 tracking-tighter">0</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Edge Node Camera Feed */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-md aspect-video relative flex items-center justify-center border-4 border-slate-800">
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                {camOnline ? (
                   <span className="bg-emerald-500 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-lg animate-pulse">LIVE</span>
                ) : (
                   <span className="bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-lg">OFFLINE</span>
                )}
                <span className="bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur-md">EDGE NODE</span>
              </div>
              
              <img 
                 src="http://localhost:5000/video_feed" 
                 alt="Live Camera Feed"
                 className={`w-full h-full object-cover ${!camOnline ? 'hidden' : ''}`}
                 onLoad={() => setCamOnline(true)}
                 onError={() => setCamOnline(false)}
              />

              {!camOnline && (
                 <div className="text-center absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                    <Video className="mx-auto text-slate-600 mb-3" size={48} />
                    <p className="text-slate-300 font-bold">Hardware Offline</p>
                    <p className="text-slate-500 text-xs mt-1 font-medium">Connect Raspberry Pi Node</p>
                 </div>
              )}
            </div>

            {/* Clean Identity Match Panel */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-5 border-b border-gray-100 pb-3 flex items-center gap-2">
                <UserCheck size={16} className="text-blue-500" /> Last Identity Match
              </h3>
              
              {lastScanned ? (
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                    <User size={40} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-black text-gray-800 leading-tight">
                      {lastScanned.first_Name} {lastScanned.last_Name}
                    </h4>
                    <p className="text-gray-500 font-mono mt-1 text-sm bg-gray-50 inline-block px-2 py-0.5 rounded border border-gray-200 font-semibold tracking-widest">
                      ID: {lastScanned.student_ID}
                    </p>
                    <div className="mt-3 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl border border-emerald-100 text-xs font-black flex items-center gap-2 shadow-sm w-fit">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Verified via Database
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
                    <UserCheck size={28} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-400">Awaiting edge node scan...</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}