import { UserCheck, AlertTriangle } from 'lucide-react';

export default function SimulationPanel({ triggerEvent, eventLogs }) {
  return (
    <aside className="w-80 bg-white text-gray-700 flex flex-col shrink-0 border-l border-gray-200 shadow-xl z-20 relative">
      
      {/* Light Blue Header */}
      <div className="p-5 border-b border-blue-100 bg-blue-50/50">
        <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <UserCheck size={20} className="text-blue-600"/> System Events
        </h3>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto">
        
        <div className="space-y-3">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Manual Overrides</h4>
          <button 
            onClick={() => triggerEvent('STUDENT_SCAN')} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 border border-blue-700 flex justify-center items-center gap-2"
          >
            Force Trigger: Scan (24-1507)
          </button>
        </div>

        {/* Clean Event Log */}
        <div className="mt-8">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" /> Live Action Log
          </h4>
          <div className="space-y-3">
            {eventLogs.map((log, i) => (
              <div key={i} className="text-sm bg-slate-50 p-3.5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${log.type === 'error' ? 'bg-rose-500' : log.type === 'success' ? 'bg-emerald-500' : 'bg-blue-400'}`}></div>
                <span className="text-xs text-gray-400 block mb-1 font-bold ml-2">{log.time}</span>
                <span className={`font-semibold ml-2 block ${
                  log.type === 'error' ? 'text-rose-700' : 
                  log.type === 'success' ? 'text-emerald-700' : 'text-gray-700'
                }`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}