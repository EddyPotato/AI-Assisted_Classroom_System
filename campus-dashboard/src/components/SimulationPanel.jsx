import { UserCheck, AlertTriangle } from 'lucide-react';

export default function SimulationPanel({ triggerEvent, eventLogs }) {
  return (
    <aside className="w-80 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-l border-slate-800 shadow-2xl z-20">
      <div className="p-5 border-b border-slate-700/50 bg-slate-800/50">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <UserCheck size={20} className="text-blue-400"/> System Events
        </h3>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto">
        
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manual Overrides</h4>
          <button onClick={() => triggerEvent('STUDENT_SCAN')} className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors border border-slate-600">
            Force Trigger: Scan (24-1507)
          </button>
        </div>

        {/* Live Event Log */}
        <div className="mt-8">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle size={14} /> Live Action Log
          </h4>
          <div className="space-y-3">
            {eventLogs.map((log, i) => (
              <div key={i} className="text-sm bg-slate-800/80 p-3 rounded-lg border border-slate-700/50 shadow-sm">
                <span className="text-xs text-slate-500 block mb-1">{log.time}</span>
                <span className={`font-medium ${
                  log.type === 'error' ? 'text-rose-400' : 
                  log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
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